const roomService = require("../services/roomService");

const getRooms = async (req, res) => {
    const rooms = await roomService.getAllRooms();

    res.status(200).json(rooms);
};

const getRoom = async (req, res) => {
    const room = await roomService.getRoomById(req.params.id);

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    res.status(200).json(room);
};

const createRoom = async (req, res) => {
    const room = await roomService.createRoom({
        ...req.body,
        hostId: req.user.id,
        players: [req.user.id]
    });

    res.status(201).json(room);
};

const updateRoom = async (req, res) => {
    const room = await roomService.updateRoom(
        req.params.id,
        req.body
    );

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    res.status(200).json(room);
};

const deleteRoom = async (req, res) => {
    const room = await roomService.deleteRoom(req.params.id);

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    res.status(200).json({
        message: "Room deleted",
        room
    });
};

module.exports = {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom
};