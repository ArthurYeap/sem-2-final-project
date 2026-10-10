const mongoose = require("mongoose");

// !middleware to check if id exists
const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }

    next();
};

module.exports = validateObjectId;