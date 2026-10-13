const gameService = require("../services/gameService");

function getUserId(req) {
    const id = req.user.id || req.user.userId || req.user._id;

    if (!id) {
        throw new Error("User ID missing from authentication token");
    }

    return id.toString();
}


const getGames = async (req, res) => {
    let filters = {};

    if (req.user.role === "admin") {
        filters = { ...req.query };
    } else {
        // Regular users can only view their own games.
        filters.userId = getUserId(req);
    }

    const result = await gameService.getAllGames(filters);

    res.status(200).json(result);
};


const getGame = async (req, res) => {
    const game = await gameService.getGameById(req.params.id);

    // ?Check if the game exists
    if (!game) {
        return res.status(404).json({
            message: "Game not found"
        });
    }
    // ?==============================================

    const isAdmin = req.user.role === "admin";

    // !check if your not an admin and the game does not belong to the user
    if (!isAdmin && game.userId._id.toString() !== getUserId(req)) {
        return res.status(404).json({
            message: "Game not found"
        });
    }
    // !=============================================================

    res.status(200).json(game);
};

    // !For single player results only.

const createGame = async (req, res) => {
    if (req.body.mode !== "singleplayer") {
        return res.status(400).json({
            message: "Only single-player results can be submitted here"
        });
    }

    const finalTime = Number(req.body.finalTime);
    const wrongInputs = Number(req.body.wrongInputs);
    const difficulty = req.body.difficulty;

    // Validate game result
    if (
        !Number.isFinite(finalTime) ||
        finalTime < 0 ||
        !Number.isInteger(wrongInputs) ||
        wrongInputs < 0
    ) {
        return res.status(400).json({
            message: "Invalid game result"
        });
    }

    // Validate difficulty
    if (!["normal", "hard"].includes(difficulty)) {
        return res.status(400).json({
            message: "Difficulty must be normal or hard"
        });
    }

    const game = await gameService.createGame({
        userId: getUserId(req),
        mode: "singleplayer",
        difficulty,
        finalTime,
        wrongInputs,
        timedOut: req.body.timedOut === true
    });

    res.status(201).json(game);
};

    // !==================================================


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

    res.status(200).json({
        message: "Game record updated successfully",
        game
    });
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
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
};
