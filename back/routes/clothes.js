const express = require("express");

const router = express.Router();

const {
  getAllClothes,
  getClothesById,
  createClothes,
  updateClothes,
  deleteClothes
} = require("../controllers/clothesController");

// Middlewares
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");
const { ValidateProduct } = require("../middleware/valdation");

// Public
router.get("/", getAllClothes);
router.get("/:id", getClothesById);

// Admin only
router.post("/", authMiddleware, adminMiddleware, ValidateProduct, createClothes);
router.put("/:id", authMiddleware, adminMiddleware, ValidateProduct, updateClothes);
router.delete("/:id", authMiddleware, adminMiddleware, deleteClothes);

module.exports = router;
