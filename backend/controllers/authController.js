const authService = require("../services/authService");

const register = async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
        message: "Registration successful",
        user
    });
};

const login = async (req, res) => {
    const result = await authService.login(req.body);

    res.status(200).json({
        message: "Login successful",
        user: result.user,
        token: result.token
    });
};

module.exports = {
    register,
    login
};