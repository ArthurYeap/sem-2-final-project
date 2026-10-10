const User = require("../models/User");
const bcrypt = require("bcrypt");


const getAllUsers = async () => {
    return await User.find().select("-password");
};

const getUserById = async (id) => {
    return await User.findById(id).select("-password");
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
    const updates = {};

    if (typeof data.username === "string") {
        updates.username = data.username.trim();
    }

    if (typeof data.email === "string") {
        updates.email = data.email.trim().toLowerCase();
    }

    if (typeof data.password === "string" && data.password.length > 0) {
        if (data.password.length < 8) {
            const error = new Error(
                "New password must be at least 8 characters long"
            );
            error.statusCode = 400;
            throw error;
        }

        updates.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updates).length === 0) {
        const error = new Error("No valid user fields provided");
        error.statusCode = 400;
        throw error;
    }

    if (updates.email) {
        const existingUser = await User.findOne({
            email: updates.email,
            _id: { $ne: id }
        });

        if (existingUser) {
            const error = new Error("Email already exists");
            error.statusCode = 409;
            throw error;
        }
    }

    return await User.findByIdAndUpdate(
        id,
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");
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