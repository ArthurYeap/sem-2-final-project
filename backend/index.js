const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const qteRoutes = require("./routes/qteRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const Game = require("./models/Game");

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
const raceIdsByRoom = new Map();
const finalizedRaces = new Set();

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/qte-prompts", qteRoutes);
app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI, {
    // ? family changes the DNS resolution to IPv4,while serverSelectionTimeoutMS sets a 10 second timeout for connection to db.
    family: 4,
    serverSelectionTimeoutMS: 10000
})
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

const savePlayerResult = async (userId, roomId, state, raceId) => {
    //! Prevent duplicate saves for the same player.
    if (state.resultSaved || state.resultSaving) {
        return null;
    }

    state.resultSaving = true;

    try {
        // ? Calculate the final time including penalties.
        const finalTime =
            state.finishTime - state.startTime + state.penaltyTime;

        const game = await Game.create({
            userId,
            mode: "multiplayer",
            roomId,
            raceId,
            finalTime,
            wrongInputs: state.wrongInputs,
            timedOut: state.timedOut
        });

        state.resultSaved = true;
        return game;
    } catch (error) {
        state.resultSaving = false;
        throw error;
    }
};

// !show race results when all players have finished or timed out
const checkRaceResults = async (roomCode, room) => {
    const raceId = raceIdsByRoom.get(roomCode);

    if (!raceId || finalizedRaces.has(raceId)) {
        return;
    }

    // *retrieving results of all players in the room
    const states = room.players.map((playerId) =>
        raceStates.get(playerId.toString())
    );

    //! Don't calculate results until every player has finished.
    if (states.length < 2 || states.some(
        (state) => !state || !state.finished || !state.resultSaved
    )) {
        return;
    }

    // ?Prevent both players' events from finalizing the race twice.
    finalizedRaces.add(raceId);

    try {
        const results = await Game.find({
            roomId: room._id,
            raceId
        }).populate("userId", "username");

        // !sorting results by completion time
        results.sort((a, b) => {
            if (a.timedOut !== b.timedOut) {
                return a.timedOut ? 1 : -1;
            }

            return a.finalTime - b.finalTime;
        });

        // !assigning ranking to players
        for (let i = 0; i < results.length; i++) {
            results[i].rank = i + 1;
            await results[i].save();
        }

        room.status = "finished";
        await room.save();

        io.to(roomCode).emit("raceResults", {
            results: results.map((result) => ({
                userId: result.userId._id.toString(),
                username: result.userId.username,
                finalTime: result.finalTime,
                wrongInputs: result.wrongInputs,
                timedOut: result.timedOut,
                rank: result.rank
            }))
        });

        // ? Clean up timers and temporary race state.
        for (const playerId of room.players) {
            const state = raceStates.get(playerId.toString());

            if (state?.timeout) {
                clearTimeout(state.timeout);
            }

            raceStates.delete(playerId.toString());
        }

        racePromptsByRoom.delete(roomCode);
        raceIdsByRoom.delete(roomCode);
        finalizedRaces.delete(raceId);

        console.log(`Race ${raceId} results finalized.`);
    } catch (error) {
        finalizedRaces.delete(raceId);
        console.error("Failed to finalize race results:", error);
    }
};

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


// *Connection listener for server
io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED:", socket.id);

    // !join room listener
    socket.on("joinRoom", async ({ roomCode, userId }) => {
        try {
            const Room = require("./models/Room");

            const room = await Room.findOne({ roomCode });

            if (!room) {
                console.log(`Room not found: ${roomCode}`);
                socket.emit("roomError", "Room not found");
                return;
            }

            socket.userId = userId;
            socket.roomCode = roomCode;

            // ? add the user to the room's player list
            if (!room.players.includes(userId)) {
                room.players.push(userId);
                await room.save();
            }
            // ?==========================================

            socket.join(roomCode);

            await room.populate({ path: "players", select: "username" });


            // !send the updated player list to all clients in the room
            io.to(roomCode).emit("playerListUpdated", {
                roomCode: roomCode,
                players: room.players
            });

        } catch (error) {
            console.error("Failed to join room:", error);
            socket.emit("roomError", "Failed to join room");
        }
    });

    // ?start game listener
    socket.on("startGame", async () => {
        try {
            const Room = require("./models/Room");
            const QtePrompt = require("./models/QtePrompt");

            // *check if the user id exist and if user is in the room
            if (!socket.userId || !socket.roomCode) {
                socket.emit("gameError", "You are not in a room");
                return;
            }

            const room = await Room.findOne({ roomCode: socket.roomCode });

            // *check if the room exists
            if (!room) {
                socket.emit("gameError", "Room not found");
                return;
            }

            //! check if the user is the host of the room
            if (room.hostId.toString() !== socket.userId.toString()) {
                socket.emit("gameError", "Only the host can start the game");
                return;
            }

            const prompts = await QtePrompt.find();

            if (prompts.length === 0) {
                socket.emit("gameError", "No QTE prompts available");
                return;
            }

            // ! Generate 50 random prompts for the race
            const racePrompts = Array.from(
                { length: 50 },
                () => {
                    const randomIndex = Math.floor(Math.random() * prompts.length);
                    return prompts[randomIndex];
                }
            );

            racePromptsByRoom.set(socket.roomCode, racePrompts);
            // !generate a unique raceId for this game session and store it in the map
            const raceId = new mongoose.Types.ObjectId().toString();
            raceIdsByRoom.set(socket.roomCode, raceId);

            room.players.forEach((playerId) => {
                const startTime = Date.now();

                //! initilaze the default state for every player
                raceStates.set(playerId.toString(), {
                    promptIndex: 0,
                    penaltyTime: 0,
                    wrongInputs: 0,
                    finished: false,
                    timedOut: false,
                    resultSaved: false,
                    resultSaving: false,
                    startTime,
                    finishTime: null,

                    //*timeout setter
                    timeout: setTimeout(async () => {
                        const state = raceStates.get(playerId.toString());

                        if (!state || state.finished) {
                            return;
                        }

                        state.finished = true;
                        state.timedOut = true;
                        state.finishTime = Date.now();

                        console.log(
                            `${playerId} timed out after 3 minutes`
                        );

                        const finalTime =
                            state.finishTime -
                            state.startTime +
                            state.penaltyTime;

                        console.log(
                            `${playerId} final time: ${finalTime}ms`
                        );

                        await savePlayerResult(
                            playerId,
                            room._id,
                            state,
                            raceId
                        );

                        io.to(socket.roomCode).emit("playerTimedOut", {
                            userId: playerId.toString()
                        });

                        await checkRaceResults(socket.roomCode, room);

                    }, 3 * 60 * 1000)
                });
            });

            room.status = "playing";
            await room.save();

            // !send the prompts to all players in the room
            io.to(socket.roomCode).emit("gameStarted", {
                prompts: racePrompts
            });

        } catch (error) {
            console.error("Failed to start game:", error);
            socket.emit("gameError", "Failed to start game");
        }
    });

    // *QTE input listener
    socket.on("qteInput", async ({ key }) => {
        try {
    // !invalid checking
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
        // !==================================================

            //!correct key input
            if (key === currentPrompt.key) {
                state.promptIndex++;

                // ! Player has finished all prompts
                if (state.promptIndex >= 50) {
                    state.finished = true;
                    state.finishTime = Date.now();

                    clearTimeout(state.timeout);

                    const raceId = raceIdsByRoom.get(socket.roomCode);


                    await savePlayerResult(
                        socket.userId,
                        room._id,
                        state,
                        raceId
                    );

                    io.to(socket.roomCode).emit("playerFinished", {
                        userId: socket.userId.toString()
                    });

                    await checkRaceResults(socket.roomCode, room);

                    return;

                } else {
                    // Player is correct but has NOT finished yet, send next prompt data
                    socket.emit("qteCorrect", {
                        promptIndex: state.promptIndex
                    });
                }
            }
            // *wrong key input
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
    });

    // ?disconnect listener
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

            // * Remove the disconnected player.
            room.players = room.players.filter(
                (playerId) =>
                    playerId.toString() !== socket.userId.toString()
            );

            //! Only end the game if 1 or fewer players remain.
            if (wasPlaying && room.players.length <= 1) {
                room.status = "finished";
                await room.save();

                io.to(socket.roomCode).emit("gameOver", {
                    winner: "opponentDisconnected"
                });

                return;
            }

            //? Save the updated player list.
            await room.save();

            //! Update the remaining players in the room.
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
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});