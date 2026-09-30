const qteService = require("../services/qteService");

const getPrompts = async (req, res) => {
    const prompts = await qteService.getAllPrompts();

    res.status(200).json(prompts);
};

const getPrompt = async (req, res) => {
    const prompt = await qteService.getPromptById(req.params.id);

    if (!prompt) {
        return res.status(404).json({
            message: "QTE prompt not found"
        });
    }

    res.status(200).json(prompt);
};

const createPrompt = async (req, res) => {
    const prompt = await qteService.createPrompt(req.body);

    res.status(201).json(prompt);
};

const updatePrompt = async (req, res) => {
    const prompt = await qteService.updatePrompt(
        req.params.id,
        req.body
    );

    if (!prompt) {
        return res.status(404).json({
            message: "QTE prompt not found"
        });
    }

    res.status(200).json(prompt);
};

const deletePrompt = async (req, res) => {
    const prompt = await qteService.deletePrompt(req.params.id);

    if (!prompt) {
        return res.status(404).json({
            message: "QTE prompt not found"
        });
    }

    res.status(200).json({
        message: "QTE prompt deleted",
        prompt
    });
};

module.exports = {
    getPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt
};