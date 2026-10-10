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
        // ?Admins can view all games or apply filters.
        filters = req.query;
    } else {
        // !Regular players can only view their own games.
        filters = {
            ...req.query,
            userId: req.user.id || req.user.userId || req.user._id
        };
    }

    const games = await gameService.getAllGames(filters);

    games.sort(
        (a, b) =>
            new Date(b.completedAt) - new Date(a.completedAt)
    );

    res.status(200).json(games);
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

    // *validate is finalTime and wrongInputs are valid numbers
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
    // *=====================================================

    const game = await gameService.createGame({
        userId: getUserId(req),
        mode: "singleplayer",
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
