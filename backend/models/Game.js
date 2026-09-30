const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },

    difficulty: {
        type: String,
        required: true
    },

    score: {
        type: Number,
        required: true
    },

    correctInputs: {
        type: Number,
        required: true
    },

    wrongInputs: {
        type: Number,
        required: true
    },

    missedInputs: {
        type: Number,
        required: true
    },

    highestCombo: {
        type: Number,
        required: true
    },

    averageReactionTime: {
        type: Number,
        required: true
    },

    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Game", gameSchema);