const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");

const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
} = require("../controllers/roomController");

const router = express.Router();

router.get("/", getRooms);
router.post("/", createRoom);
router.get("/:id", validateObjectId, getRoom);
router.put("/:id", validateObjectId, updateRoom);
router.delete("/:id", validateObjectId, deleteRoom);

module.exports = router;