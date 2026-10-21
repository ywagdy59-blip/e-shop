// لازم ييجي بعد authMiddleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access Denied, Admins only"
    });
  }
  next();
};

module.exports = adminMiddleware;
