require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const run = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters");
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email },
      { $set: { name: "NOVA Administrator", email, password: hashedPassword, role: "admin" } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    console.log(`Administrator account is ready: ${email}`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => { console.error(error.message); process.exitCode = 1; });
