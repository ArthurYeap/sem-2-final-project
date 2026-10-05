const validatePrompt = (req, res, next) => {
    const { key, difficulty, timeLimit, points } = req.body;

    if (!key || !difficulty || timeLimit === undefined || points === undefined) {
        return res.status(400).json({
            message: "key, difficulty, timeLimit and points are required"
        });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({
            message: "Difficulty must be easy, medium or hard"
        });
    }

    if (timeLimit <= 0) {
        return res.status(400).json({
            message: "Time limit must be greater than 0"
        });
    }

    if (points < 0) {
        return res.status(400).json({
            message: "Points cannot be negative"
        });
    }

    next();
};

module.exports = validatePrompt;