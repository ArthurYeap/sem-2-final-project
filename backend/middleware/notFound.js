// !middleware handle 404 for routes

const notFound = (req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};

module.exports = notFound;