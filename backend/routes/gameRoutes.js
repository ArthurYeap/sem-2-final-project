const express = require("express");

const {
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
} = require("../controllers/gameController");

const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getGames));

router.post("/", asyncHandler(createGame));

router.get(
    "/:id",
    validateObjectId,
    asyncHandler(getGame)
);

router.put(
    "/:id",
    validateObjectId,
    asyncHandler(updateGame)
);

router.delete(
    "/:id",
    validateObjectId,
    asyncHandler(deleteGame)
);

module.exports = router;