const express = require("express");

const router = express.Router();

const {
  createCheckoutSession,
  verifySession
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authmiddleware");
const { ValidateCheckout } = require("../middleware/valdation");

// ملحوظة: الـ webhook متسجل في index.js مش هنا (محتاج raw body)

router.post(
  "/create-checkout-session",
  authMiddleware,
  ValidateCheckout,
  createCheckoutSession
);

router.get("/verify/:sessionId", authMiddleware, verifySession);

module.exports = router;
