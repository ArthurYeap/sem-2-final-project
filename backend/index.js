const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const qteRoutes = require("./routes/qteRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const QtePrompt = require("./models/QtePrompt");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require('./middleware/errorHandler');
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

const raceStates = new Map();
const racePromptsByRoom = new Map();

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/qte-prompts", qteRoutes);
app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000
})
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// ==========================================
// === MAIN SOCKET CONNECTION OPEN ===
// ==========================================
io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED:", socket.id);

    // ------------------------------------------
    // 1. JOIN ROOM LISTENER
    // ------------------------------------------
    socket.on("joinRoom", async ({ roomCode, userId }) => {
        try {
            const Room = require("./models/Room");

            console.log("Room code:", roomCode);
            console.log("User ID:", userId);

            const room = await Room.findOne({ roomCode });

            if (!room) {
                console.log(`Room not found: ${roomCode}`);
                socket.emit("roomError", "Room not found");
                return;
            }

            socket.userId = userId;
            socket.roomCode = roomCode;

            if (!room.players.includes(userId)) {
                room.players.push(userId);
                await room.save();
            }

            socket.join(roomCode);
            console.log(`${userId} joined room ${roomCode}`);

            const updatedRoom = await Room.findById(room._id)
                .populate("players", "username");

            io.to(roomCode).emit("playerListUpdated", {
                roomCode: roomCode,
                players: updatedRoom.players
            });

        } catch (error) {
            console.error("Failed to join room:", error);
            socket.emit("roomError", "Failed to join room");
        }
    });

    // ------------------------------------------
    // 2. START GAME LISTENER
    // ------------------------------------------
    socket.on("startGame", async () => {
        try {
            const Room = require("./models/Room");
            const QtePrompt = require("./models/QtePrompt");

            if (!socket.userId || !socket.roomCode) {
                socket.emit("gameError", "You are not in a room");
                return;
            }

            const room = await Room.findOne({ roomCode: socket.roomCode });

            if (!room) {
                socket.emit("gameError", "Room not found");
                return;
            }

            if (room.hostId.toString() !== socket.userId.toString()) {
                socket.emit("gameError", "Only the host can start the game");
                return;
            }

            const prompts = await QtePrompt.find();

            if (prompts.length === 0) {
                socket.emit("gameError", "No QTE prompts available");
                return;
            }

            const racePrompts = Array.from(
                { length: 50 },
                () => {
                    const randomIndex = Math.floor(Math.random() * prompts.length);
                    return prompts[randomIndex];
                }
            );

            racePromptsByRoom.set(socket.roomCode, racePrompts);

            room.players.forEach((playerId) => {
                const startTime = Date.now();

                raceStates.set(playerId.toString(), {
                    promptIndex: 0,
                    penaltyTime: 0,
                    wrongInputs: 0,
                    finished: false,
                    timedOut: false,
                    startTime,
                    finishTime: null,
                    timeout: setTimeout(() => {
                        const state = raceStates.get(playerId.toString());

                        if (!state || state.finished) {
                            return;
                        }

                        state.finished = true;
                        state.timedOut = true;
                        state.finishTime = Date.now();

                        console.log(`${playerId} timed out after 3 minutes`);

                        io.to(socket.roomCode).emit("playerTimedOut", {
                            userId: playerId.toString()
                        });
                    }, 3 * 60 * 1000)
                });
            });

            room.status = "playing";
            await room.save();

            console.log(`${socket.userId} started room ${socket.roomCode}`);

            io.to(socket.roomCode).emit("gameStarted", {
                prompts: racePrompts
            });

        } catch (error) {
            console.error("Failed to start game:", error);
            socket.emit("gameError", "Failed to start game");
        }
    }); // Closes startGame listener safely!

    // ------------------------------------------
    // 3. QTE INPUT LISTENER (Moved completely outside startGame)
    // ------------------------------------------
    socket.on("qteInput", async ({ key }) => {
        try {
            if (!socket.userId || !socket.roomCode) {
                return;
            }

            const state = raceStates.get(socket.userId.toString());

            if (!state) {
                return;
            }

            const Room = require("./models/Room");
            const room = await Room.findOne({ roomCode: socket.roomCode });

            if (!room || room.status !== "playing") {
                return;
            }

            const prompts = racePromptsByRoom.get(socket.roomCode);

            if (!prompts) {
                return;
            }

            const currentPrompt = prompts[state.promptIndex];

            if (!currentPrompt) {
                return;
            }

            console.log(`${socket.userId} pressed ${key}, expected ${currentPrompt.key}`);

            // === 1. Correct Input Condition ===
            if (key === currentPrompt.key) {
                state.promptIndex++;

                // Player finished all 50 prompts
                if (state.promptIndex >= 50) {
                    state.finished = true;
                    state.finishTime = Date.now();

                    clearTimeout(state.timeout);

                    const raceTime = state.finishTime - state.startTime;
                    const finalTime = raceTime + state.penaltyTime;

                    console.log(`${socket.userId} final time: ${finalTime}ms`);

                    io.to(socket.roomCode).emit("playerFinished", {
                        userId: socket.userId.toString()
                    });

                    return;
                } else {
                    // Player is correct but has NOT finished yet, send next prompt data
                    socket.emit("qteCorrect", {
                        nextPromptIndex: state.promptIndex
                    });
                }
            }
            // === 2. Wrong Input Condition ===
            else {
                state.wrongInputs++;
                state.penaltyTime += 2000;

                socket.emit("qteWrong", {
                    wrongInputs: state.wrongInputs,
                    penaltyTime: state.penaltyTime
                });
            }

        } catch (error) {
            console.error("Failed to process QTE input:", error);
        }
    }); // Closes qteInput listener safely!

    // ------------------------------------------
    // 4. DISCONNECT LISTENER
    // ------------------------------------------

    socket.on("disconnect", async (reason) => {
        try {
            console.log("SOCKET DISCONNECTED:", socket.id, reason);

            if (!socket.userId || !socket.roomCode) {
                return;
            }

            const Room = require("./models/Room");

            const room = await Room.findOne({
                roomCode: socket.roomCode
            });

            if (!room) {
                return;
            }

            const wasPlaying = room.status === "playing";

            room.players = room.players.filter(
                (playerId) =>
                    playerId.toString() !== socket.userId.toString()
            );

            await room.save();

            if (wasPlaying) {
                room.status = "finished";

                await room.save();

                io.to(socket.roomCode).emit("gameOver", {
                    winner: "opponentDisconnected"
                });

                return;
            }

            const updatedRoom = await Room.findById(room._id)
                .populate("players", "username");

            io.to(socket.roomCode).emit("playerListUpdated", {
                roomCode: socket.roomCode,
                players: updatedRoom.players
            });

        } catch (error) {
            console.error(
                "Failed to handle disconnect:",
                error
            );
        }
    });
}); // <-- THIS closes io.on("connection")


// ==========================================
// START SERVER
// ==========================================

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});