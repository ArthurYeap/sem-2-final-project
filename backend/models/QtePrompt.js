const mongoose = require("mongoose");

const qtePromptSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        required: true
    },

    timeLimit: {
        type: Number,
        required: true
    },

    points: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("QtePrompt", qtePromptSchema);