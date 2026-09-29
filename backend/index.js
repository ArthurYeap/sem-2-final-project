const express = require("express");
const qteRoutes = require("./routes/qteRoutes");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/qte-prompts", qteRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});