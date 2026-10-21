require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./confing/db");

const usersRoutes = require("./routes/users");
const clothesRoutes = require("./routes/clothes");
const categoriesRoutes = require("./routes/catogers");
const ordersRoutes = require("./routes/order");
const paymentsRoutes = require("./routes/payment");

const { stripeWebhook } = require("./controllers/paymentController");
const { notFound, errorHandler } = require("./middleware/errormidleware");

const app = express();

const PORT = process.env.PORT || 3000;
const configuredClientUrls = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredClientUrls);

if (process.env.NODE_ENV !== "production") {
  for (const port of [5173, 5174]) {
    allowedOrigins.add(`http://localhost:${port}`);
    allowedOrigins.add(`http://127.0.0.1:${port}`);
  }
}

// =====================================
// CORS
// =====================================
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("This origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

// =====================================
// STRIPE WEBHOOK
// لازم يكون قبل express.json() عشان Stripe محتاج الـ body الخام (raw)
// =====================================
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// =====================================
// BODY PARSER
// =====================================
app.use(express.json());

// =====================================
// HOME
// =====================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Clothes Store API"
  });
});

// =====================================
// API ROUTES
// =====================================
app.use("/api/users", usersRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);

// =====================================
// 404 + ERROR HANDLER
// =====================================
app.use(notFound);
app.use(errorHandler);

// =====================================
// START SERVER
// =====================================
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
