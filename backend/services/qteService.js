const QtePrompt = require("../models/QtePrompt");

const getAllPrompts = async () => {
    return await QtePrompt.find();
};

const getPromptById = async (id) => {
    return await QtePrompt.findById(id);
};

const createPrompt = async (data) => {
    return await QtePrompt.create(data);};

const updatePrompt = async (id, data) => {
    return await QtePrompt.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

const deletePrompt = async (id) => {
    return await QtePrompt.findByIdAndDelete(id);
};

module.exports = {
    getAllPrompts,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt
};