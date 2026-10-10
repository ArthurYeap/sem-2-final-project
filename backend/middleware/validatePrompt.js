// ! make sure the field "key" is required
const validatePrompt = (req, res, next) => {
    const { key } = req.body;

    if (!key ) {
        return res.status(400).json({
            message: "key are required"
        });
    }

    next();
};

module.exports = validatePrompt;