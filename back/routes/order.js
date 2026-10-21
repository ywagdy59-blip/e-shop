const express = require("express");

const router = express.Router();

const {
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

router.get("/my", authMiddleware, getMyOrders);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
