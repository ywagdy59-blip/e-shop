const asyncHandler = require("express-async-handler");

const Clothes = require("../models/clothes");

// يمنع إن المستخدم يبعت Regex خطير في البحث
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// =====================================
// GET ALL CLOTHES  -  GET /api/clothes?search=&category=
// =====================================
const getAllClothes = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.search) {
    filter.name = { $regex: escapeRegex(String(req.query.search)), $options: "i" };
  }

  if (req.query.category) {
    filter.category = String(req.query.category);
  }

  const products = await Clothes.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// =====================================
// GET CLOTHES BY ID  -  GET /api/clothes/:id
// =====================================
const getClothesById = asyncHandler(async (req, res) => {
  const product = await Clothes.findById(req.params.id).populate("category", "name");

  if (!product) {
    res.status(404);
    throw new Error("Clothing Product Not Found");
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// =====================================
// CREATE  -  POST /api/clothes  (Admin)
// =====================================
const createClothes = asyncHandler(async (req, res) => {
  const newProduct = await Clothes.create(req.body);

  res.status(201).json({
    success: true,
    message: "Clothing Product Created Successfully",
    data: newProduct
  });
});

// =====================================
// UPDATE  -  PUT /api/clothes/:id  (Admin)
// =====================================
const updateClothes = asyncHandler(async (req, res) => {
  const product = await Clothes.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true
  });

  if (!product) {
    res.status(404);
    throw new Error("Clothing Product Not Found");
  }

  res.status(200).json({
    success: true,
    message: "Clothing Product Updated Successfully",
    data: product
  });
});

// =====================================
// DELETE  -  DELETE /api/clothes/:id  (Admin)
// =====================================
const deleteClothes = asyncHandler(async (req, res) => {
  const product = await Clothes.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Clothing Product Not Found");
  }

  res.status(200).json({
    success: true,
    message: "Clothing Product Deleted Successfully",
    data: product
  });
});

module.exports = {
  getAllClothes,
  getClothesById,
  createClothes,
  updateClothes,
  deleteClothes
};
