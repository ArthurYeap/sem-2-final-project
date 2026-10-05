const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");
const validatePrompt = require("../middleware/validatePrompt");

const {
    getPrompts,
    createPrompt,
    getPrompt,
    deletePrompt,
    updatePrompt
} = require("../controllers/qteController");

const router = express.Router();

router.get("/", asyncHandler(getPrompts));
router.post("/", validatePrompt, asyncHandler(createPrompt));

router.get("/:id", validateObjectId, asyncHandler(getPrompt));
router.delete("/:id", validateObjectId, asyncHandler(deletePrompt));
router.put(
    "/:id",
    validateObjectId,
    validatePrompt,
    asyncHandler(updatePrompt)
);
module.exports = router;