const mongoose = require("mongoose");
const qtePromptSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"]
    },

    timeLimit: {
        type: Number,
        required: true,
        min: 1
    },

    points: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model("QtePrompt", qtePromptSchema);