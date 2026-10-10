const Room = require("../models/Room");

const getAllRooms = async () => {
    return await Room.find();
};

const getRoomById = async (id) => {
    return await Room.findById(id)
        .populate("hostId")
        .populate("players")
};
const createRoom = async (data) => {
    return await Room.create(data);
};

const updateRoom = async (id, data) => {
    return await Room.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

const deleteRoom = async (id) => {
    return await Room.findByIdAndDelete(id);
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};