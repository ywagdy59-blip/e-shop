const Joi = require("joi");

// Product Validation Schema
const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string().hex().length(24).allow(null),
  price: Joi.number().required().positive(),
  size: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  color: Joi.string().trim().min(2).max(30).required(),
  brand: Joi.string().trim().min(2).max(50).required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().trim().min(5).max(500).required(),
  image: Joi.string().uri().required()
});

// Category Validation Schema
const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(500).allow("")
});

// Checkout Validation Schema
const checkoutSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).max(20).required(),
        size: Joi.string().trim().allow("")
      })
    )
    .min(1)
    .required()
});

// Generic validator
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details.map((item) => item.message)
    });
  }

  req.body = value;
  next();
};

const ValidateProduct = validate(productSchema);
const ValidateCategory = validate(categorySchema);
const ValidateCheckout = validate(checkoutSchema);

module.exports = { ValidateProduct, ValidateCategory, ValidateCheckout };
