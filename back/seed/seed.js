require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Category = require("../models/catogery");
const Clothes = require("../models/clothes");
const Order = require("../models/order");

// ===============================
// CONNECT DATABASE
// ===============================
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB Connected");
};

// ===============================
// SEED USERS
// ===============================
const seedUsers = async () => {
  await User.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123", 10);
  const userPassword = await bcrypt.hash("User123", 10);

  await User.insertMany([
    { name: "Admin User", email: "admin@example.com", password: adminPassword, role: "admin" },
    { name: "Ahmed User", email: "ahmed@example.com", password: userPassword, role: "user" },
    { name: "Mohamed User", email: "mohamed@example.com", password: userPassword, role: "user" }
  ]);

  console.log("Users Seeded");
};

// ===============================
// SEED CATEGORIES + PRODUCTS
// ===============================
const seedProducts = async () => {
  await Order.deleteMany();
  await Clothes.deleteMany();
  await Category.deleteMany();

  const [men, women, kids] = await Category.insertMany([
    { name: "Men", description: "Men clothes" },
    { name: "Women", description: "Women clothes" },
    { name: "Kids", description: "Kids clothes" }
  ]);

  const img = (photoId) =>
    `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

  await Clothes.insertMany([
    {
      name: "Classic White T-Shirt",
      category: men._id,
      price: 15,
      size: ["S", "M", "L", "XL"],
      color: "White",
      brand: "Basic",
      stock: 50,
      description: "100% cotton classic fit t-shirt.",
      image: img("photo-1521572163474-6864f9cf17ab")
    },
    {
      name: "Slim Fit Jeans",
      category: men._id,
      price: 40,
      size: ["30", "32", "34", "36"],
      color: "Blue",
      brand: "DenimCo",
      stock: 30,
      description: "Slim fit stretch denim jeans.",
      image: img("photo-1542272604-787c3835535d")
    },
    {
      name: "Summer Dress",
      category: women._id,
      price: 35,
      size: ["S", "M", "L"],
      color: "Red",
      brand: "Flora",
      stock: 20,
      description: "Light summer dress with floral print.",
      image: img("photo-1539109136881-3be0616acf4b")
    },
    {
      name: "Hoodie",
      category: women._id,
      price: 30,
      size: ["M", "L", "XL"],
      color: "Grey",
      brand: "Comfy",
      stock: 25,
      description: "Warm fleece hoodie with front pocket.",
      image: img("photo-1551028719-00167b16eac5")
    },
    {
      name: "Kids Pajama Set",
      category: kids._id,
      price: 18,
      size: ["4Y", "6Y", "8Y"],
      color: "Yellow",
      brand: "Tiny",
      stock: 40,
      description: "Soft cotton pajama set for kids.",
      image: img("photo-1519238263530-99bdd11df2ea")
    },
    {
      name: "Everyday Linen Shirt",
      category: men._id,
      price: 28,
      size: ["S", "M", "L", "XL"],
      color: "Sand",
      brand: "NOVA Studio",
      stock: 18,
      description: "A relaxed linen-blend shirt for warm days and easy layering.",
      image: img("photo-1596755094514-f87e34085b2c")
    },
    {
      name: "Relaxed Cotton Trousers",
      category: men._id,
      price: 32,
      size: ["30", "32", "34", "36"],
      color: "Stone",
      brand: "NOVA Studio",
      stock: 14,
      description: "Soft everyday trousers with a comfortable relaxed fit.",
      image: img("photo-1473966968600-fa801b869a1a")
    },
    {
      name: "Soft Knit Cardigan",
      category: women._id,
      price: 42,
      size: ["S", "M", "L"],
      color: "Cream",
      brand: "Softline",
      stock: 12,
      description: "A light, soft-knit layer that works from morning to evening.",
      image: img("photo-1434389677669-e08b4cac3105")
    },
    {
      name: "Everyday Midi Skirt",
      category: women._id,
      price: 34,
      size: ["S", "M", "L", "XL"],
      color: "Olive",
      brand: "NOVA Studio",
      stock: 9,
      description: "An easy-flowing midi skirt made for everyday plans.",
      image: img("photo-1583496661160-fb5886a0aaaa")
    },
    {
      name: "Canvas Weekend Sneakers",
      category: men._id,
      price: 48,
      size: ["40", "41", "42", "43", "44"],
      color: "Off white",
      brand: "Offday",
      stock: 16,
      description: "Clean canvas sneakers with a cushioned everyday sole.",
      image: img("photo-1542291026-7eec264c27ff")
    },
    {
      name: "Mini Crossbody Bag",
      category: women._id,
      price: 38,
      size: ["One size"],
      color: "Tan",
      brand: "NOVA Studio",
      stock: 7,
      description: "A compact crossbody bag for the essentials you carry daily.",
      image: img("photo-1548036328-c9fa89d128fa")
    },
    {
      name: "Kids Everyday Hoodie",
      category: kids._id,
      price: 24,
      size: ["4Y", "6Y", "8Y", "10Y"],
      color: "Blue",
      brand: "Tiny",
      stock: 21,
      description: "A soft cotton-blend hoodie made for play and layering.",
      image: img("photo-1519238263530-99bdd11df2ea")
    },
    {
      name: "Kids Cotton T-Shirt",
      category: kids._id,
      price: 12,
      size: ["4Y", "6Y", "8Y", "10Y"],
      color: "White",
      brand: "Tiny",
      stock: 25,
      description: "A breathable cotton tee for school days and weekends.",
      image: img("photo-1503342217505-b0a15ec3261c")
    }
  ]);

  console.log("Categories & Products Seeded");
};

// ===============================
// RUN
// ===============================
const runSeed = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The seed command is disabled in production because it deletes existing data");
    }

    await connectDB();
    await seedUsers();
    await seedProducts();
    console.log("Seeding Done");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();
