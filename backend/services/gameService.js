const Game = require("../models/Game");



const getAllGames = async (filters = {}) => {
    const query = {};


    const Room = require("../models/Room");

// ?Search games by their associated room code.
    if (filters.roomCode && filters.roomCode.trim()) {
        const matchingRooms = await Room.find({
            roomCode: {
                $regex: filters.roomCode.trim(),
                $options: "i"
            }
        }).select("_id");

        query.roomId = {
            $in: matchingRooms.map((room) => room._id)
        };
    }
    // ?=====================================

    // !Filters
    if (filters.mode) {
        query.mode = filters.mode;
    }

    if (filters.difficulty) {
        query.difficulty = filters.difficulty;
    }

    if (filters.status === "timedOut") {
        query.timedOut = true;
        query.forfeited = { $ne: true };
    } else if (filters.status === "forfeited") {
        query.forfeited = true;
    } else if (filters.status === "completed") {
        query.timedOut = { $ne: true };
        query.forfeited = { $ne: true };
    }
    if (filters.userId) {
        query.userId = filters.userId;
    }

    if (filters.roomId) {
        query.roomId = filters.roomId;
    }

    if (filters.rank) {
        query.rank = Number(filters.rank);
    }

    // ?Pagination
    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(filters.limit, 10) || 10)
    );

    const totalGames = await Game.countDocuments(query);
    const totalPages = Math.ceil(totalGames / limit);
    const currentPage = totalPages === 0
        ? 1
        : Math.min(page, totalPages);

    // ! sorting
    const sortOptions = {
        newest: { completedAt: -1 },
        oldest: { completedAt: 1 },
        fastest: { finalTime: 1 },
        slowest: { finalTime: -1 },
        fewestMistakes: { wrongInputs: 1 },
        mostMistakes: { wrongInputs: -1 }
    };

    const sortBy = sortOptions[filters.sort] || sortOptions.newest;

    const games = await Game.find(query)
        .populate("userId", "username")
        .populate("roomId", "roomCode")
        .sort(sortBy)
        .skip((currentPage - 1) * limit)
        .limit(limit);

    return {
        games,
        totalGames,
        totalPages,
        currentPage,
        limit
    };
};


const getGameById = async (id) => {
    return await Game.findById(id)
        .populate("userId")
        .populate("roomId");
};

const createGame = async (data) => {
    return await Game.create(data);
};


const updateGame = async (id, data) => {
    const updates = {};

    // ?final time
    if (data.finalTime !== undefined) {
        const finalTime = Number(data.finalTime);

        if (!Number.isFinite(finalTime) || finalTime < 0) {
            const error = new Error(
                "Final time must be a valid non-negative number."
            );
            error.statusCode = 400;
            throw error;
        }

        updates.finalTime = finalTime;
    // ?============================================================
    }

    // !wrong inputs
    if (data.wrongInputs !== undefined) {
        const wrongInputs = Number(data.wrongInputs);

        if (
            !Number.isInteger(wrongInputs) ||
            wrongInputs < 0
        ) {
            const error = new Error(
                "Wrong inputs must be a non-negative whole number."
            );
            error.statusCode = 400;
            throw error;
        }

        updates.wrongInputs = wrongInputs;
    //     !============================================
    }

    // *timed out
    if (data.timedOut !== undefined) {
        if (typeof data.timedOut !== "boolean") {
            const error = new Error(
                "Timeout status must be true or false."
            );
            error.statusCode = 400;
            throw error;
        }

        updates.timedOut = data.timedOut;
    //     *============================================
    }


    // ?forfeited
    if (data.forfeited !== undefined) {
        if (typeof data.forfeited !== "boolean") {
            const error = new Error(
                "Forfeit status must be true or false."
            );
            error.statusCode = 400;
            throw error;
        }

        updates.forfeited = data.forfeited;
    }
    // ?============================================

    // ! update field not empty
    if (Object.keys(updates).length === 0) {
        const error = new Error(
            "Please provide at least one valid field to update."
        );
        error.statusCode = 400;
        throw error;
    //     !========================================
    }

    return await Game.findByIdAndUpdate(
        id,
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    )
        .populate("userId", "username email")
        .populate("roomId");
};


const deleteGame = async (id) => {
    return await Game.findByIdAndDelete(id);
};

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};