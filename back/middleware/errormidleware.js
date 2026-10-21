// =====================================
// 404 - Route Not Found
// =====================================
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

// =====================================
// GLOBAL ERROR HANDLER
// أي throw new Error(...) جوه asyncHandler بيوصل هنا
// =====================================
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Server error";

  // ID مش صالح (مثلاً /api/clothes/123)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // أخطاء الـ Mongoose validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // قيمة مكررة في حقل unique
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };
