const Game = require("../models/Game");

const getAllGames = async (filters = {}) => {
    const query = {};

    if (filters.mode) {
        query.mode = filters.mode;
    }

    if (filters.userId) {
        query.userId = filters.userId;
    }

    if (filters.roomId) {
        query.roomId = filters.roomId;
    }

    if (filters.rank) {
        query.rank = filters.rank;
    }

    return await Game.find(query)
        .populate("userId")
        .populate("roomId");
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
    }

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
    }

    if (data.timedOut !== undefined) {
        if (typeof data.timedOut !== "boolean") {
            const error = new Error(
                "Timeout status must be true or false."
            );
            error.statusCode = 400;
            throw error;
        }

        updates.timedOut = data.timedOut;
    }

    if (Object.keys(updates).length === 0) {
        const error = new Error(
            "Please provide at least one valid field to update."
        );
        error.statusCode = 400;
        throw error;
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