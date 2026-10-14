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
const readyPlayersByRoom = new Map();
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
            difficulty: state.difficulty,
            wrongInputs: state.wrongInputs,
            timedOut: state.timedOut,
            forfeited: state.forfeited || false
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

    console.log("Race states:", states.map((state) => ({
        finished: state?.finished,
        timedOut: state?.timedOut,
        forfeited: state?.forfeited,
        resultSaved: state?.resultSaved,
        resultSaving: state?.resultSaving
    })));

    // ?Prevent both players' events from finalizing the race twice.
    finalizedRaces.add(raceId);

    try {
        const results = await Game.find({
            roomId: room._id,
            raceId
        }).populate("userId", "username");

        const getOutcomePriority = (result) => {
            if (!result.timedOut && !result.forfeited) return 0;
            if (result.forfeited) return 1;
            return 2;
        };

        // !sorting results by completion time

        results.sort((a, b) => {
            const priorityDifference =
                getOutcomePriority(a) - getOutcomePriority(b);

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            return a.finalTime - b.finalTime;
        });

        // !assigning ranking to players
        for (let i = 0; i < results.length; i++) {
            results[i].rank = i + 1;
            await results[i].save();
        }

        room.status = "waiting";
        await room.save();

        // *Clear previous race readiness.
        readyPlayersByRoom.set(roomCode, new Set());

        // ! emit the final results to all players in the room
        io.to(roomCode).emit("raceResults", {
            results: results.map((result) => ({
                userId: result.userId._id.toString(),
                username: result.userId.username,
                finalTime: result.finalTime,
                wrongInputs: result.wrongInputs,
                timedOut: result.timedOut,
                forfeited: result.forfeited,
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

            // ? Initialize the ready players set for this room if it doesn't exist
            if (!readyPlayersByRoom.has(roomCode)) {
                readyPlayersByRoom.set(roomCode, new Set());
            }

            socket.userId = userId;
            socket.roomCode = roomCode;

            await Room.updateOne(
                { _id: room._id },
                { $addToSet: { players: userId } }
            );

            socket.join(roomCode);


            const updatedRoom = await Room.findOne({ roomCode })
                .populate("players", "username");


            // !send the updated player list to all clients in the room
            io.to(roomCode).emit("playerListUpdated", {
                roomCode,
                players: updatedRoom.players,
                readyPlayers: [
                    ...(readyPlayersByRoom.get(roomCode) || new Set())
                ],
                hostId: updatedRoom.hostId.toString(),
                difficulty: updatedRoom.difficulty
            });

        } catch (error) {
            console.error("Failed to join room:", error);
            socket.emit("roomError", "Failed to join room");
        }
    });

    // *ready listener
    socket.on("toggleReady", async ({ ready }) => {
        try {
            // !invalid checking
            const Room = require("./models/Room");

            if (!socket.userId || !socket.roomCode) {
                socket.emit("gameError", "You are not in a room");
                return;
            }

            const room = await Room.findOne({
                roomCode: socket.roomCode
            });

            if (!room) {
                socket.emit("gameError", "Room not found");
                return;
            }

            if (room.status === "playing") {
                socket.emit("gameError", "The game has already started");
                return;
            }

            if (room.status === "finished") {
                socket.emit("gameError", "This game has already finished");
                return;
            }
            const isPlayerInRoom = room.players.some(
                (playerId) =>
                    playerId.toString() === socket.userId.toString()
            );

            if (!isPlayerInRoom) {
                socket.emit("gameError", "You are not a player in this room");
                return;
            }
            // !=================================================

            // ? Initialize the ready players set for this room if it doesn't exist
            if (!readyPlayersByRoom.has(socket.roomCode)) {
                readyPlayersByRoom.set(socket.roomCode, new Set());
            }

            const readyPlayers = readyPlayersByRoom.get(socket.roomCode);
            const userId = socket.userId.toString();

            if (ready === true) {
                readyPlayers.add(userId);
            } else {
                readyPlayers.delete(userId);
            }

            // * Emit the updated ready status to all clients in the room
            io.to(socket.roomCode).emit("readyStatusUpdated", {
                readyPlayers: [...readyPlayers]
            });

        } catch (error) {
            console.error("Failed to update ready status:", error);
            socket.emit("gameError", "Failed to update ready status");
        }
    });

    // ? prompt timer listener
    const startPromptTimer = (userId, roomCode, room, raceId) => {
        const id = userId.toString();
        const state = raceStates.get(id);

        if (!state || state.finished) {
            return;
        }

        // ! Clear any existing prompt timer before starting a new one.
        clearTimeout(state.promptTimeout);

        state.promptTimeout = setTimeout(async () => {
            try {
                // * declare state again incase state get cleared while timeout haven't run
                const currentState = raceStates.get(id);

                if (!currentState || currentState.finished) {
                    return;
                }

                currentState.wrongInputs++;
                currentState.penaltyTime += 1000;
                currentState.promptIndex++;

                io.to(roomCode).emit("promptExpired", {
                    userId: id,
                    promptIndex: currentState.promptIndex,
                    wrongInputs: currentState.wrongInputs,
                    penaltyTime: currentState.penaltyTime
                });

                //? Expiring the final prompt still finishes the game.
                if (currentState.promptIndex >= 50) {
                    currentState.finished = true;
                    currentState.finishTime = Date.now();

                    clearTimeout(currentState.timeout);
                    clearTimeout(currentState.promptTimeout);

                    await savePlayerResult(
                        userId,
                        room._id,
                        currentState,
                        raceId
                    );

                    io.to(roomCode).emit("playerFinished", {
                        userId: id
                    });

                    await checkRaceResults(roomCode, room);
                    return;
                }

                // !Start the timer for the next prompt.
                startPromptTimer(userId, roomCode, room, raceId);
            } catch (error) {
                console.error("Failed to process prompt timeout:", error);
            }
        }, state.promptDuration);
    };

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

            if (room.players.length < 2) {
                socket.emit("gameError", "At least 2 players are required");
                return;
            }

            //? Check if readyPlayersByRoom has roomCode else create a new set
            const readyPlayers =
                readyPlayersByRoom.get(socket.roomCode) || new Set();

            const everyoneReady = room.players.every(
                (playerId) => readyPlayers.has(playerId.toString())
            );

            if (!everyoneReady) {
                socket.emit("gameError", "Everyone must be ready before starting");
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
            const difficulty =
                room.difficulty === "hard" ? "hard" : "normal";

            const promptDuration =
                difficulty === "hard" ? 500 : 1000;
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
                    difficulty,
                    promptDuration,
                    promptTimeout: null,
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
                        state.forfeited = false;
                        state.finishTime = Date.now();

                        clearTimeout(state.promptTimeout);

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

                    }, 120 * 1000)
                }
                   );
                startPromptTimer(
                    playerId,
                    socket.roomCode,
                    room,
                    raceId
                );
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

            if (!state || state.finished || state.timedOut) {
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
                clearTimeout(state.promptTimeout);

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
                    // ? Player is correct but has NOT finished yet, send next prompt data
                    socket.emit("qteCorrect", {
                        promptIndex: state.promptIndex
                    });
                    startPromptTimer(
                        socket.userId,
                        socket.roomCode,
                        room,
                        raceIdsByRoom.get(socket.roomCode)
                    );
                }
            }
            // *wrong key input
            else {
                state.wrongInputs++;
                state.penaltyTime += 1000;

                socket.emit("qteWrong", {
                    wrongInputs: state.wrongInputs,
                    penaltyTime: state.penaltyTime
                });
            }

        } catch (error) {
            console.error("Failed to process QTE input:", error);
        }
    });

    // ? change difficulty listener
    socket.on("changeDifficulty", async ({ difficulty }) => {
        try {
            const Room = require("./models/Room");

            if (!socket.userId || !socket.roomCode) {
                socket.emit("gameError", "You are not in a room");
                return;
            }

            // !Only allow valid difficulty values.
            if (!["normal", "hard"].includes(difficulty)) {
                socket.emit("gameError", "Invalid difficulty");
                return;
            }

            const room = await Room.findOne({
                roomCode: socket.roomCode
            });

            if (!room) {
                socket.emit("gameError", "Room not found");
                return;
            }

            if (room.hostId.toString() !== socket.userId.toString()) {
                socket.emit("gameError", "Only the host can change difficulty");
                return;
            }

            if (room.status !== "waiting") {
                socket.emit(
                    "gameError",
                    "Difficulty can only be changed in the waiting room"
                );
                return;
            }

            room.difficulty = difficulty;
            await room.save();

            //? Everyone in the room receives the updated difficulty.
            io.to(socket.roomCode).emit("difficultyUpdated", {
                difficulty: room.difficulty
            });

        } catch (error) {
            console.error("Failed to change difficulty:", error);
            socket.emit("gameError", "Failed to change difficulty");
        }
    });

    // ! forfeit listener
    socket.on("forfeitGame", async () => {
        try {
            if (!socket.userId || !socket.roomCode) {
                return;
            }

            const Room = require("./models/Room");

            const userId = socket.userId.toString();
            const roomCode = socket.roomCode;
            const room = await Room.findOne({ roomCode });

            if (!room || room.status !== "playing") {
                return;
            }

            const state = raceStates.get(userId);

            if (!state || state.finished || state.timedOut) {
                return;
            }

            //! Mark this player as forfeited.
            state.finished = true;
            state.forfeited = true;
            state.timedOut = false;
            state.finishTime = Date.now();

            clearTimeout(state.timeout);
            clearTimeout(state.promptTimeout);

            const raceId = raceIdsByRoom.get(roomCode);

            await savePlayerResult(
                userId,
                room._id,
                state,
                raceId
            );

            console.log(`${userId} forfeited the race`);

            io.to(roomCode).emit("playerTimedOut", {
                userId,
                forfeited: true
            });

            // ?Find players who are still actively racing.
            const activePlayers = room.players.filter((playerId) => {
                const playerState = raceStates.get(
                    playerId.toString()
                );

                // ? Only return players who are still racing (not finished, timed out, or forfeited).
                return (
                    playerState &&
                    !playerState.finished &&
                    !playerState.timedOut &&
                    !playerState.forfeited
                );
            });

            // *If only one player is still racing, finish their race.
            if (activePlayers.length === 1) {
                const winnerId = activePlayers[0].toString();
                const winnerState = raceStates.get(winnerId);

                if (winnerState) {
                    winnerState.finished = true;
                    winnerState.finishTime = Date.now();

                    clearTimeout(winnerState.timeout);
                    clearTimeout(winnerState.promptTimeout);

                    await savePlayerResult(
                        winnerId,
                        room._id,
                        winnerState,
                        raceId
                    );
                }
            }

            await checkRaceResults(roomCode, room);

        } catch (error) {
            console.error("Failed to forfeit game:", error);
            socket.emit("gameError", "Failed to forfeit game");
        }
    });

    // *return to room listener
    socket.on("returnToRoom", async () => {
        try {
            // !invalid checking
            if (!socket.userId || !socket.roomCode) {
                socket.emit("gameError", "You are not in a room");
                return;
            }

            const Room = require("./models/Room");

            const room = await Room.findOne({
                roomCode: socket.roomCode
            });

            if (!room) {
                socket.emit("gameError", "Room not found");
                return;
            }
            // !================================================

            const userId = socket.userId.toString();
            const state = raceStates.get(userId);

            // ? allow players to return to the room even if someone else is playing, but only if they have finished or forfeited their race.
            if (room.status === "playing" && (!state || !state.finished)) {
                socket.emit("gameError", "You must finish or forfeit the race first");
                return;
            }
            socket.emit("returnedToRoom");

        } catch (error) {
            console.error("Failed to return to room:", error);
            socket.emit("gameError", "Failed to return to room");
        }
    });

    // ?disconnect listener
    socket.on("disconnect", async (reason) => {
        try {
            console.log("SOCKET DISCONNECTED:", socket.id, reason);

            if (!socket.userId || !socket.roomCode) {
                return;
            }

            const userId = socket.userId.toString();
            const roomCode = socket.roomCode;
            const Room = require("./models/Room");

            // ! Remove the disconnected player from the ready list.
            const readyPlayers = readyPlayersByRoom.get(roomCode);

            if (readyPlayers) {
                readyPlayers.delete(userId);
            }

            const room = await Room.findOne({ roomCode });

            if (!room) {
                return;
            }

            // ! If the game is currently in progress, handle the disconnection as a forfeit.
            const wasPlaying = room.status === "playing";

            if (wasPlaying) {
                const state = raceStates.get(userId);

                if (state && !state.finished) {
                    state.finished = true;
                    state.forfeited = true;
                    state.timedOut = false;
                    state.finishTime = Date.now();

                    clearTimeout(state.timeout);
                    clearTimeout(state.promptTimeout);

                    const raceId = raceIdsByRoom.get(roomCode);

                    await savePlayerResult(
                        userId,
                        room._id,
                        state,
                        raceId
                    );


                    io.to(roomCode).emit("playerTimedOut", {
                        userId,
                        forfeited: true
                    });
                }



                // ! get active players.
                const activePlayers = room.players
                    .map((playerId) => playerId.toString())
                    .filter((playerId) => {

                        // *Exclude the disconnected player.

                        if (playerId === userId) {
                            return false;
                        }

                        const playerState = raceStates.get(playerId);

                        // ? Only return players who are still racing are active.
                        return playerState && !playerState.finished;
                    });

                // ! end the race if only one player is left
                if (activePlayers.length === 1) {
                    const winnerId = activePlayers[0];
                    const winnerState = raceStates.get(winnerId);

                    if (winnerState && !winnerState.finished) {
                        winnerState.finished = true;
                        winnerState.forfeited = false;
                        winnerState.timedOut = false;
                        winnerState.finishTime = Date.now();

                        clearTimeout(winnerState.timeout);
                        clearTimeout(winnerState.promptTimeout);

                        const raceId = raceIdsByRoom.get(roomCode);

                        await savePlayerResult(
                            winnerId,
                            room._id,
                            winnerState,
                            raceId
                        );

                        io.to(roomCode).emit("gameOver", {
                            winner: winnerId,
                            reason: "opponentDisconnected"
                        });
                    }
                }

                // *Finalize only when all race participants have results.
                await checkRaceResults(roomCode, room);

                return;
            }

            // ! remove player from room list if player disconnects while in waiting room
            room.players = room.players.filter(
                (playerId) => playerId.toString() !== userId
            );

            await room.save();

            const updatedRoom = await Room.findById(room._id)
                .populate("players", "username");

            io.to(roomCode).emit("playerListUpdated", {
                roomCode,
                players: updatedRoom.players,
                readyPlayers: [
                    ...(readyPlayersByRoom.get(roomCode) || new Set())
                ],
                hostId: updatedRoom.hostId.toString(),
                difficulty: updatedRoom.difficulty
            });
        } catch (error) {
            console.error("Failed to handle disconnect:", error);
        }
    });
});


server.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});