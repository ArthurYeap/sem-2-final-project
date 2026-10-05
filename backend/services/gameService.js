const Game = require("../models/Game");

const getAllGames = async (filters = {}) => {
    const query = {};

    if (filters.difficulty) {
        query.difficulty = filters.difficulty;
    }

    if (filters.userId) {
        query.userId = filters.userId;
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
    return await Game.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
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