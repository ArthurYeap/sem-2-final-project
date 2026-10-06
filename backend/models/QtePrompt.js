const mongoose = require("mongoose");

const qtePromptSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    }
});

module.exports = mongoose.model("QtePrompt", qtePromptSchema);