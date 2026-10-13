const Product = require("../models/Product");

const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (productData) => {
  const product = await Product.create(productData);

  return product;
};

const updateProduct = async (id, productData) => {
  const product = await Product.findByIdAndUpdate(
    id,
    productData,
    {
      new: true,
      runValidators: true
    }
  );

  return product;
};

const deleteProduct = async (id) =>{
  const product =await Product.findByIdAndDelete(id);

  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
 createProduct,
 updateProduct,
 deleteProduct
};