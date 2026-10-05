const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const register = async (data) => {
    const existingUser = await User.findOne({
        email: data.email
    });

    if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: "user"
    });

    const { password, ...safeUser } = user.toObject();

    return safeUser;
};

const login = async (data) => {
    const user = await User.findOne({
        email: data.email
    });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatch = await bcrypt.compare(
        data.password,
        user.password
    );

    if (!passwordMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const { password, ...safeUser } = user.toObject();

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        user: safeUser,
        token
    };
};

module.exports = {
    register,
    login
};