const userService = require("../services/userService");

const getUsers = async (req, res) => {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
};

const getUser = async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json(user);
};

const createUser = async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json(user);
};

const updateUser = async (req, res) => {
    const user = await userService.updateUser(
        req.params.id,
        req.body
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json(user);
};

const deleteUser = async (req, res) => {
    const user = await userService.deleteUser(req.params.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        message: "User deleted",
        user
    });
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};