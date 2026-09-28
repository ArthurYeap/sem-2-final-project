const express = require("express");

const app = express();
app.use(express.json());
const PORT = 5000

app.get("/rooms/:id", (req, res) => {
    res.send(`You are in rooms ${req.params.id}`);
});

app.get("/qte", (req, res) => {
    res.send(`You have chosen ${req.query.difficulty}`);
});

app.post("/rooms", (req, res) => {
    console.log(req.body);

    res.json(req.body);
});

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});

