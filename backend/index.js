const express = require("express");
const qteRoutes = require("./routes/qteRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound")
const errorHandler = require('./middleware/errorHandler')
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");


dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/qte-prompts", qteRoutes);
app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

app.use(notFound);
// !runs when there is a error with the service
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000
})
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});