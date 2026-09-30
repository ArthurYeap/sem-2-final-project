const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", validateObjectId, getUser);
router.put("/:id", validateObjectId, updateUser);
router.delete("/:id", validateObjectId, deleteUser);

module.exports = router;