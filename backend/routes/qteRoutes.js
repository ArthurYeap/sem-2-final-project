const express = require("express");
const {
    getPrompts,
    createPrompt,
    updatePrompt,
    getPrompt,
    deletePrompt
} = require("../controllers/qteController");

const router = express.Router();

router.get("/", getPrompts);
router.post("/", createPrompt);
router.get("/:id", getPrompt);
router.delete("/:id", deletePrompt);
router.put("/:id", updatePrompt);

module.exports = router;