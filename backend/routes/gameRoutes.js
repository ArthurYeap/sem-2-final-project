const express = require("express");

const {
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
} = require("../controllers/gameController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getGames));

router.get(
    "/:id",
    validateObjectId,
    asyncHandler(getGame)
);

router.post("/", asyncHandler(createGame));

router.put(
    "/:id",
    adminMiddleware,
    validateObjectId,
    asyncHandler(updateGame)
);

router.delete(
    "/:id",
    adminMiddleware,
    validateObjectId,
    asyncHandler(deleteGame)
);

module.exports = router;
