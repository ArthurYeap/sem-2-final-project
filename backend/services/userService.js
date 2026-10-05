const User = require("../models/User");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
    return await User.find();
};

const getUserById = async (id) => {
    return await User.findById(id);
};

const createUser = async (data) => {
    const existingUser = await User.findOne({
        email: data.email
    });

    if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await User.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role
    });
};

const updateUser = async (id, data) => {
    return await User.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};