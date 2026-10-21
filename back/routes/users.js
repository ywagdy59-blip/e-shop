const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleAdminLogin,
  forgotPassword,
  resetPassword,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

// =====================================
// PUBLIC
// =====================================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-admin-login", googleAdminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// =====================================
// PROTECTED
// /me لازم تكون قبل /:id
// =====================================
router.get("/me", authMiddleware, getMe);

router.get("/", authMiddleware, adminMiddleware, getUsers);

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
