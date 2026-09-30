const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true
    },

    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    status: {
        type: String,
        enum: ["waiting", "playing", "finished"],
        default: "waiting"
    },

    difficulty: {
        type: String,
        required: true
    },

    currentPromptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QtePrompt"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Room", roomSchema);