const {       getAllPromptsService,
    getPromptByIdService,
    createPromptService,
    updatePromptService,
    deletePromptService} = require("../services/qteService");

const getPrompts = (req, res) => {
    const prompts = getAllPromptsService()
    res.status(200).json(prompts);
};
const getPrompt = (req, res) => {

    const id = Number(req.params.id);

    const prompt = getPromptByIdService(id);

    if (!prompt) {
        return res.status(404).json({
            message: "QTE prompt not found"
        });
    }

    res.status(200).json(prompt);
};

const createPrompt = (req, res) => {

    const prompt = createPromptService(req.body);

    res.status(201).json(prompt);
};

const updatePrompt = (req, res) => {

    const id = Number(req.params.id);

    const prompt = updatePromptService(id, req.body);

    if (!prompt) {
        return res.status(404).json({
            message: "QTE prompt not found"
        });
    }

    res.status(200).json(prompt);
};

const deletePrompt = (req, res) => {

    const id = Number(req.params.id);

    const prompt = deletePromptService(id);

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
    createPrompt,
    getPrompt,
    updatePrompt,
    deletePrompt
};