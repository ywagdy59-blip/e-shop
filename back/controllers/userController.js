const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/user");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================================
// HELPERS
// =====================================
const MIN_PASSWORD_LENGTH = 6; // لو بتستخدم Joi بـ 8 خليهم نفس الرقم
const MAX_PASSWORD_LENGTH = 128;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// حقول ما ينفعش ترجع للفرونت أبداً
const SAFE_USER_FIELDS = "-password -passwordResetToken -passwordResetExpires";

// شكل اليوزر اللي بيرجع للفرونت (من غير الباسورد)
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const isDuplicateKeyError = (err) => err && err.code === 11000;

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// صاحب الحساب أو الأدمن بس
const canAccessUser = (req) =>
  req.user.role === "admin" || String(req.user.id) === req.params.id;

// تحقق موحد للباسورد (بيتأكد إنه string الأول)
const assertValidPassword = (res, password) => {
  if (typeof password !== "string" || !password) {
    res.status(400);
    throw new Error("Enter a password.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400);
    throw new Error(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    res.status(400);
    throw new Error(`Your password must be no longer than ${MAX_PASSWORD_LENGTH} characters.`);
  }
};

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
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400);
    throw new Error("Enter a valid email address, for example name@example.com.");
  }

  assertValidPassword(res, password);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists. Sign in or use a different email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user" // التسجيل دايماً user، الأدمن بيتعمل من الـ seed
    });
  } catch (err) {
    // طلبين بنفس الإيميل في نفس اللحظة
    if (isDuplicateKeyError(err)) {
      res.status(409);
      throw new Error("An account with this email already exists. Sign in or use a different email.");
    }
    throw err;
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: createToken(user),
    user: userResponse(user)
  });
});

// =====================================
// GOOGLE ADMIN LOGIN
// =====================================
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
      audience: clientId
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
    user: userResponse(user)
  });
});

// =====================================
// LOGIN  -  POST /api/users/login
// =====================================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || typeof password !== "string" || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail });

  // user.password ممكن يبقى فاضي (مثلاً حساب اتعمل من برّه)، فبنتأكد قبل compare
  const passwordOk =
    user && user.password && (await bcrypt.compare(password, user.password));

  if (!passwordOk) {
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
// FORGOT / RESET PASSWORD
// =====================================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    res.status(400);
    throw new Error("Email is required");
  }

  // نفس الرد في كل الحالات، عشان محدش يعرف إيميل مسجل ولا لأ
  const genericResponse = {
    success: true,
    message: "If an account exists for this email, a reset link has been prepared."
  };

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(200).json(genericResponse);

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = sha256(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // الإيميل لسه مش متظبط. اللينك بيتعرض في development بس (مش "أي حاجة غير production")
  // عشان لو NODE_ENV مش متحدد على السيرفر ما يتسربش اللينك لأي حد.
  if (process.env.NODE_ENV === "development") {
    genericResponse.resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  }

  res.status(200).json(genericResponse);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (typeof token !== "string" || !token) {
    res.status(400);
    throw new Error("A valid reset token is required");
  }
  assertValidPassword(res, password);

  const user = await User.findOne({
    passwordResetToken: sha256(token),
    passwordResetExpires: { $gt: new Date() }
  });

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
  const user = await User.findById(req.user.id).select(SAFE_USER_FIELDS);

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
  const users = await User.find().select(SAFE_USER_FIELDS).sort({ createdAt: -1 });

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

  const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS);

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

  if (name) {
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      res.status(400);
      throw new Error("Your name must be between 2 and 50 characters.");
    }
    user.name = trimmedName;
  }

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400);
      throw new Error("Enter a valid email address, for example name@example.com.");
    }
    if (normalizedEmail !== user.email) {
      const emailTaken = await User.findOne({ email: normalizedEmail });
      if (emailTaken) {
        res.status(409);
        throw new Error("Email already exists");
      }
      user.email = normalizedEmail;
    }
  }

  if (password) {
    assertValidPassword(res, password);
    user.password = await bcrypt.hash(password, 10);
  }

  // تغيير الصلاحية للأدمن بس
  if (role && req.user.role === "admin" && ["user", "admin"].includes(role)) {
    user.role = role;
  }

  try {
    await user.save();
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409);
      throw new Error("Email already exists");
    }
    throw err;
  }

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