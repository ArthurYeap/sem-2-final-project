const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    mode: {
        type: String,
        enum: ["singleplayer", "multiplayer"],
        required: true
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },

    finalTime: {
        type: Number,
        required: true,
        min: 0
    },

    wrongInputs: {
        type: Number,
        required: true,
        min: 0
    },

    rank: {
        type: Number,
        min: 1
    },

    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Game", gameSchema);