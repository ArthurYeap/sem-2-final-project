const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    asyncHandler(getUsers)
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    asyncHandler(createUser)
);

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    asyncHandler(getUser)
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    asyncHandler(updateUser)
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    asyncHandler(deleteUser)
);
module.exports = router;