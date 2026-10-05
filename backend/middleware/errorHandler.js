// !    catch error from asyncHandler
const errorHandler = (error, req, res, next) => {
    console.error(error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.errors
        });
    }

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }

    // Duplicate value
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];

        return res.status(409).json({
            message: `${field} already exists`
        });
    }
    
    // Unknown error
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        message: error.message || "Something went wrong on the server"
    });
};

module.exports = errorHandler;