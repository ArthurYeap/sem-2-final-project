const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");

const {
    getPrompts,
    createPrompt,
    getPrompt,
    deletePrompt,
    updatePrompt
} = require("../controllers/qteController");

const router = express.Router();

router.get("/", getPrompts);
router.post("/", createPrompt);

router.get("/:id", validateObjectId, getPrompt);
router.delete("/:id", validateObjectId, deletePrompt);
router.put("/:id", validateObjectId, updatePrompt);

module.exports = router;