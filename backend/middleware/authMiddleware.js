const jwt = require("jsonwebtoken");

// ! Check if user is aunthenticated by veryfing JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // ! jtw fetched from api starts with bearer, if not return 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }
    // !===========================================================

    // ? splitting since syntax is "Bearer <token>"
    const token = authHeader.split(" ")[1];
    // ?===========================================================


    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // *returns payload
        req.user = decoded;
        // *======================================================

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;