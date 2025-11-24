const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authentication");
const { getUsers } = require("./get");
const { getUserById } = require("./get");
const { updateUser } = require("./put");
const { deleteUser } = require("./delete");
const { createUser } = require("./post");

router.get("/", authMiddleware, getUsers);
router.get("/:userId", authMiddleware, getUserById);
router.post("/create", createUser);
router.put("/:userId", authMiddleware, updateUser);
router.delete("/:userId", authMiddleware, deleteUser);

module.exports = router;