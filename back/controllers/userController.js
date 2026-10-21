const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/user");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// شكل اليوزر اللي بيرجع للفرونت (من غير الباسورد)
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// صاحب الحساب أو الأدمن بس
const canAccessUser = (req) =>
  req.user.role === "admin" || req.user.id === req.params.id;

// =====================================
// REGISTER  -  POST /api/users/register
// =====================================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";

  if (!normalizedName) {
    res.status(400);
    throw new Error("Enter your full name.");
  }
  if (normalizedName.length < 2 || normalizedName.length > 50) {
    res.status(400);
    throw new Error("Your name must be between 2 and 50 characters.");
  }

  if (!normalizedEmail) {
    res.status(400);
    throw new Error("Enter your email address.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error("Enter a valid email address, for example name@example.com.");
  }

  if (typeof password !== "string" || !password) {
    res.status(400);
    throw new Error("Enter a password.");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Your password must be at least 6 characters.");
  }
  if (password.length > 128) {
    res.status(400);
    throw new Error("Your password must be no longer than 128 characters.");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists. Sign in or use a different email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user" // التسجيل دايماً user، الأدمن بيتعمل من الـ seed
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: createToken(user),
    user: userResponse(user)
  });
});

const googleAdminLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const allowedAdminEmail = normalizeEmail(process.env.ADMIN_GOOGLE_EMAIL);

  if (!clientId || !allowedAdminEmail) {
    res.status(503);
    throw new Error("Google admin sign-in is not configured. Ask the store administrator to finish Google setup.");
  }

  if (typeof credential !== "string" || !credential) {
    res.status(400);
    throw new Error("Google did not provide a sign-in credential. Please try again.");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401);
    throw new Error("Google could not verify this sign-in. Please try again.");
  }

  const email = normalizeEmail(payload?.email);
  if (!payload?.email_verified || !email || email !== allowedAdminEmail) {
    res.status(403);
    throw new Error("This Google account is not authorized for store administration.");
  }

  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    res.status(403);
    throw new Error("This Google account is not linked to an administrator account.");
  }

  res.status(200).json({
    success: true,
    message: "Administrator sign-in successful",
    token: createToken(user),
    user: userResponse(user),
  });
});

// =====================================
// LOGIN  -  POST /api/users/login
// =====================================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: createToken(user),
    user: userResponse(user)
  });
});

// =====================================
// FORGOT / RESET PASSWORD (development-safe reset link)
// =====================================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: normalizedEmail });
  // Do not reveal whether an email belongs to an account.
  if (!user) return res.status(200).json({ success: true, message: "If the account exists, a reset link has been prepared." });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const response = { success: true, message: "A password reset link has been prepared." };
  // Email delivery has not been configured in this local project. Expose the link only outside production for testing.
  if (process.env.NODE_ENV !== "production") {
    response.resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  }
  res.status(200).json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    res.status(400);
    throw new Error("A valid token and a password of at least 6 characters are required");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired");
  }
  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({ success: true, message: "Password reset successfully" });
});

// =====================================
// GET ME  -  GET /api/users/me
// =====================================
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ success: true, data: user });
});

// =====================================
// GET ALL USERS  -  GET /api/users  (Admin)
// =====================================
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// =====================================
// GET USER BY ID  -  GET /api/users/:id  (Owner / Admin)
// =====================================
const getUserById = asyncHandler(async (req, res) => {
  if (!canAccessUser(req)) {
    res.status(403);
    throw new Error("Not allowed");
  }

  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ success: true, data: user });
});

// =====================================
// UPDATE USER  -  PUT /api/users/:id  (Owner / Admin)
// =====================================
const updateUser = asyncHandler(async (req, res) => {
  if (!canAccessUser(req)) {
    res.status(403);
    throw new Error("Not allowed");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, password, role } = req.body;

  if (name) user.name = String(name).trim();

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail && normalizedEmail !== user.email) {
    const emailTaken = await User.findOne({ email: normalizedEmail });
    if (emailTaken) {
      res.status(400);
      throw new Error("Email already exists");
    }
    user.email = normalizedEmail;
  }

  if (password) {
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = await bcrypt.hash(password, 10);
  }

  // تغيير الصلاحية للأدمن بس
  if (role && req.user.role === "admin" && ["user", "admin"].includes(role)) {
    user.role = role;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: userResponse(user)
  });
});

// =====================================
// DELETE USER  -  DELETE /api/users/:id  (Owner / Admin)
// =====================================
const deleteUser = asyncHandler(async (req, res) => {
  if (!canAccessUser(req)) {
    res.status(403);
    throw new Error("Not allowed");
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

module.exports = {
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
};
