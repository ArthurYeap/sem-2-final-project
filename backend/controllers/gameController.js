const gameService = require("../services/gameService");

const getAllGames = async (req, res) => {
    const games = await gameService.getAllGames(req.query);

    res.status(200).json(games);
};

const getGameById = async (req, res) => {
    const game = await gameService.getGameById(req.params.id);

    if (!game) {
        return res.status(404).json({
            message: "Game not found"
        });
    }

    res.status(200).json(game);
};

const createGame = async (req, res) => {
    const game = await gameService.createGame(req.body);

    res.status(201).json(game);
};

const updateGame = async (req, res) => {
    const game = await gameService.updateGame(
        req.params.id,
        req.body
    );

    if (!game) {
        return res.status(404).json({
            message: "Game not found"
        });
    }

    res.status(200).json(game);
};

const deleteGame = async (req, res) => {
    const game = await gameService.deleteGame(req.params.id);

    if (!game) {
        return res.status(404).json({
            message: "Game not found"
        });
    }

    res.status(200).json({
        message: "Game deleted successfully"
    });
};

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};