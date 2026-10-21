const asyncHandler = require("express-async-handler");

const Category = require("../models/catogery");
const Clothes = require("../models/clothes");

// مقارنة الاسم من غير ما تفرق Capital/Small
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

// =====================================
// GET ALL CATEGORIES  -  GET /api/categories
// =====================================
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// =====================================
// GET CATEGORY BY ID  -  GET /api/categories/:id
// =====================================
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// =====================================
// CREATE CATEGORY  -  POST /api/categories  (Admin)
// =====================================
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existingCategory = await Category.findOne({ name }).collation(CASE_INSENSITIVE);

  if (existingCategory) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({ name, description });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category
  });
});

// =====================================
// UPDATE CATEGORY  -  PUT /api/categories/:id  (Admin)
// =====================================
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (name) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category
  });
});

// =====================================
// DELETE CATEGORY  -  DELETE /api/categories/:id  (Admin)
// =====================================
const deleteCategory = asyncHandler(async (req, res) => {
  const productUsesCategory = await Clothes.exists({ category: req.params.id });
  if (productUsesCategory) {
    res.status(409);
    throw new Error("Move products to another category before deleting this category");
  }

  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully"
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
