let qtePrompts = [{
    id: 1,
    key: "A",
    difficulty: "easy",
    timeLimit: 1000,
    points: 100
}, {
    id: 2,
    key: "SPACE",
    difficulty: "hard",
    timeLimit: 500,
    points: 200
}];

const getAllPromptsService = () => {
    return qtePrompts;
};

const getPromptByIdService = (id) => {
    return qtePrompts.find(prompt => prompt.id === id);
};

const createPromptService = (data) => {

    const newPrompt = {
        id: qtePrompts.length + 1,
        key: data.key,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        points: data.points
    };

    qtePrompts.push(newPrompt);

    return newPrompt;
};

const updatePromptService = (id, data) => {

    const prompt = qtePrompts.find(prompt => prompt.id === id);

    if (!prompt) {
        return null;
    }

    prompt.key = data.key;
    prompt.difficulty = data.difficulty;
    prompt.timeLimit = data.timeLimit;
    prompt.points = data.points;

    return prompt;
};

const deletePromptService = (id) => {

    const index = qtePrompts.findIndex(prompt => prompt.id === id);

    if (index === -1) {
        return null;
    }

    const deletedPrompt = qtePrompts.splice(index, 1);

    return deletedPrompt[0];
};

module.exports = {
    getAllPromptsService,
    getPromptByIdService,
    createPromptService,
    updatePromptService,
    deletePromptService
};