const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");

const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
} = require("../controllers/roomController");

const router = express.Router();

router.get("/", asyncHandler(getRooms));

router.post(
    "/",
    authMiddleware,
    asyncHandler(createRoom)
);

router.get("/:id", validateObjectId, asyncHandler(getRoom));
router.put("/:id", validateObjectId, asyncHandler(updateRoom));
router.delete("/:id", validateObjectId, asyncHandler(deleteRoom));

module.exports = router;