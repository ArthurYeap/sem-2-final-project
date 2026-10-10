const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");
const validatePrompt = require("../middleware/validatePrompt");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getPrompts,
    createPrompt,
    getPrompt,
    deletePrompt,
    updatePrompt
} = require("../controllers/qteController");

const router = express.Router();

// Public routes: players can view prompts
router.get("/", asyncHandler(getPrompts));
router.get("/:id", validateObjectId, asyncHandler(getPrompt));

// Admin-only routes: modify prompts
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validatePrompt,
    asyncHandler(createPrompt)
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    asyncHandler(deletePrompt)
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    validatePrompt,
    asyncHandler(updatePrompt)
);

module.exports = router;