const QtePrompt = require("../models/QtePrompt");

const getAllPrompts = async (filters = {}) => {
    const query = {};

    if (filters.difficulty) {
        query.difficulty = filters.difficulty;
    }

    if (filters.key) {
        query.key = filters.key.toUpperCase();
    }

    return await QtePrompt.find(query);
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
        {
            new: true,
            runValidators: true
        }    );
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