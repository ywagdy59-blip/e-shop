require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Category = require("../models/catogery");
const Clothes = require("../models/clothes");
const User = require("../models/user");

const image = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

const demoAccounts = [
  {
    name: "NOVA Demo Administrator",
    email: "demo.admin@nova.example",
    password: "NOVA-Demo-2026!",
    role: "admin",
  },
  {
    name: "NOVA Demo Customer",
    email: "demo.customer@nova.example",
    password: "NOVA-Customer-2026!",
    role: "user",
  },
];

const categoryNames = ["Men", "Women", "Kids", "Accessories"];
const sampleProducts = [
  {
    name: "Everyday Linen Shirt",
    category: "Men",
    price: 28,
    size: ["S", "M", "L", "XL"],
    color: "Sand",
    brand: "NOVA Studio",
    stock: 18,
    description: "A relaxed linen-blend shirt for warm days and easy layering.",
    image: image("photo-1596755094514-f87e34085b2c"),
  },
  {
    name: "Relaxed Cotton Trousers",
    category: "Men",
    price: 32,
    size: ["30", "32", "34", "36"],
    color: "Stone",
    brand: "NOVA Studio",
    stock: 14,
    description: "Soft everyday trousers with a comfortable relaxed fit.",
    image: image("photo-1473966968600-fa801b869a1a"),
  },
  {
    name: "Soft Knit Cardigan",
    category: "Women",
    price: 42,
    size: ["S", "M", "L"],
    color: "Cream",
    brand: "Softline",
    stock: 12,
    description: "A light, soft-knit layer that works from morning to evening.",
    image: image("photo-1434389677669-e08b4cac3105"),
  },
  {
    name: "Everyday Midi Skirt",
    category: "Women",
    price: 34,
    size: ["S", "M", "L", "XL"],
    color: "Olive",
    brand: "NOVA Studio",
    stock: 9,
    description: "An easy-flowing midi skirt made for everyday plans.",
    image: image("photo-1583496661160-fb5886a0aaaa"),
  },
  {
    name: "Canvas Weekend Sneakers",
    category: "Men",
    price: 48,
    size: ["40", "41", "42", "43", "44"],
    color: "Off white",
    brand: "Offday",
    stock: 16,
    description: "Clean canvas sneakers with a cushioned everyday sole.",
    image: image("photo-1542291026-7eec264c27ff"),
  },
  {
    name: "Mini Crossbody Bag",
    category: "Women",
    price: 38,
    size: ["One size"],
    color: "Tan",
    brand: "NOVA Studio",
    stock: 7,
    description: "A compact crossbody bag for the essentials you carry daily.",
    image: image("photo-1548036328-c9fa89d128fa"),
  },
  {
    name: "Kids Everyday Hoodie",
    category: "Kids",
    price: 24,
    size: ["4Y", "6Y", "8Y", "10Y"],
    color: "Blue",
    brand: "Tiny",
    stock: 21,
    description: "A soft cotton-blend hoodie made for play and layering.",
    image: image("photo-1519238263530-99bdd11df2ea"),
  },
  {
    name: "Kids Cotton T-Shirt",
    category: "Kids",
    price: 12,
    size: ["4Y", "6Y", "8Y", "10Y"],
    color: "White",
    brand: "Tiny",
    stock: 25,
    description: "A breathable cotton tee for school days and weekends.",
    image: image("photo-1503342217505-b0a15ec3261c"),
  },
  {
    name: "Striped Everyday Blouse",
    category: "Women",
    price: 29,
    size: ["S", "M", "L", "XL"],
    color: "Blue stripe",
    brand: "NOVA Studio",
    stock: 15,
    description: "A light cotton blouse with an easy shape for workdays and slow weekends.",
    image: image("photo-1598554747436-c9293d6a588f"),
  },
  {
    name: "Relaxed Utility Jacket",
    category: "Men",
    price: 56,
    size: ["S", "M", "L", "XL"],
    color: "Olive",
    brand: "Offday",
    stock: 10,
    description: "A versatile lightweight jacket with roomy pockets and a comfortable fit.",
    image: image("photo-1591047139829-d91aecb6caea"),
  },
  {
    name: "Soft Weekend Hoodie",
    category: "Women",
    price: 39,
    size: ["S", "M", "L"],
    color: "Oatmeal",
    brand: "Softline",
    stock: 13,
    description: "A soft brushed layer for cool mornings, travel days, and everything between.",
    image: image("photo-1556821840-3a63f95609a7"),
  },
  {
    name: "Classic Denim Jacket",
    category: "Men",
    price: 62,
    size: ["M", "L", "XL", "XXL"],
    color: "Mid blue",
    brand: "NOVA Studio",
    stock: 8,
    description: "A timeless denim layer designed to soften and look better with every wear.",
    image: image("photo-1516257984-b1b4d707412e"),
  },
  {
    name: "Everyday Canvas Tote",
    category: "Women",
    price: 18,
    size: ["One size"],
    color: "Natural",
    brand: "Offday",
    stock: 24,
    description: "A sturdy roomy canvas tote for errands, books, and days spent out and about.",
    image: image("photo-1544816155-12df9643f363"),
  },
  {
    name: "Kids Playday Sweatshirt",
    category: "Kids",
    price: 22,
    size: ["4Y", "6Y", "8Y", "10Y"],
    color: "Rust",
    brand: "Tiny",
    stock: 17,
    description: "A cosy cotton-blend sweatshirt that is ready for school days and play dates.",
    image: image("photo-1519238263530-99bdd11df2ea"),
  },
  {
    name: "Soft Ribbed Tank",
    category: "Women",
    price: 16,
    size: ["XS", "S", "M", "L"],
    color: "Cream",
    brand: "Softline",
    stock: 20,
    description: "A soft ribbed cotton layer that works on its own or under your favourite shirt.",
    image: image("photo-1503342217505-b0a15ec3261c"),
  },
  {
    name: "Kids Weekend Shorts",
    category: "Kids",
    price: 15,
    size: ["4Y", "6Y", "8Y", "10Y"],
    color: "Sand",
    brand: "Tiny",
    stock: 19,
    description: "Easy pull-on shorts in soft cotton, made for sunny weekends and big adventures.",
    image: image("photo-1503919005314-30d93d07d823"),
  },
  {
    name: "Everyday Leather Belt",
    category: "Accessories",
    price: 21,
    size: ["S", "M", "L", "XL"],
    color: "Cognac",
    brand: "NOVA Studio",
    stock: 14,
    description: "A versatile leather belt with a simple buckle, made to finish everyday outfits.",
    image: image("photo-1553062407-98eeb64c6a62"),
  },
  {
    name: "Weekend Crossbody Pouch",
    category: "Accessories",
    price: 26,
    size: ["One size"],
    color: "Black",
    brand: "Offday",
    stock: 11,
    description: "A compact crossbody pouch to keep your everyday essentials close at hand.",
    image: image("photo-1548036328-c9fa89d128fa"),
  },
];

const run = async () => {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Demo data can only be added when NODE_ENV=development");
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing from back/.env");
  }

  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 8000 });

  for (const account of demoAccounts) {
    const password = await bcrypt.hash(account.password, 10);
    await User.findOneAndUpdate(
      { email: account.email },
      { $set: { name: account.name, password, role: account.role } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }

  const categories = new Map();
  for (const name of categoryNames) {
    let category = await Category.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (!category) category = await Category.create({ name, description: `${name} collection` });
    categories.set(name, category._id);
  }

  let added = 0;
  for (const product of sampleProducts) {
    const exists = await Clothes.exists({ name: product.name });
    if (exists) continue;
    await Clothes.create({
      ...product,
      category: categories.get(product.category),
    });
    added += 1;
  }

  console.log(`Demo data ready: ${demoAccounts.length} demo accounts available, ${added} sample products added; existing store data was kept.`);
};

run()
  .catch((error) => {
    console.error("Could not add demo products:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
