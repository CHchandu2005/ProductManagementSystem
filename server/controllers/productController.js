const Product = require("../models/Product");
const AppError = require("../utils/errorHandler");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) return reject(new AppError("Image upload failed", 500));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// const getProducts = async (req, res) => {
//   const { search, category, sort, order = "asc", skip = 0, limit = 10 } = req.query;
//   let query = {};

//   if (search) query.name = { $regex: search, $options: "i" };
//   if (category) query.category = category;

//   let products = Product.find(query);
//   if (sort) products = products.sort({ [sort]: order === "asc" ? 1 : -1 });

//   products = products.skip(Number(skip)).limit(Number(limit));

//   const results = await products;
//   const totalCount = await Product.countDocuments(query);

//   res.json({ success: true, products: results, totalCount });
// };


const getProducts = async (req, res, next) => {
  console.log("get product function in backend hii");

  const { search, categories, sort, order = "asc" } = req.query;
  let { page = 1, limit = 3 } = req.query;
  page = Number(page) > 0 ? Number(page) : 1;
  limit = Number(limit) > 0 ? Number(limit) : 10;

  const query = {};

  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [{ name: regex }, { description: regex }];
  }

  if (categories) {
    const decodedCategories = decodeURIComponent(categories)
      .split(",")
      .map((c) => c.trim());
    query.category = { $in: decodedCategories };
  }

  let productsQuery = Product.find(query);

  // Sorting (optional)
  if (sort) {
    const sortField = String(sort).replace("-", "");
    const sortOrder = order === "desc" ? -1 : 1;
    productsQuery = productsQuery.sort({ [sortField]: sortOrder });
  }

  const totalItems = await Product.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * limit;

  const products = await productsQuery.skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    page: safePage,
    limit,
    totalPages,
    totalItems,
    products,
  });
};





const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, product });
};

const addProduct = async (req, res) => {
  try {
    console.log("addProduct function called");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { name, price, description, category } = req.body;
    if (!name || !price || !description || !category) {
      throw new AppError("All fields are required", 400);
    }

    let imageUrl;
    if (req.file) {
      console.log("Uploading image to Cloudinary...");
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
        console.log("Image uploaded successfully:", imageUrl);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        // For now, use a placeholder image URL if Cloudinary fails
        imageUrl = "https://via.placeholder.com/300x300?text=Image+Upload+Failed";
        console.log("Using placeholder image due to Cloudinary error");
      }
    } else {
      throw new AppError("Image is required", 400);
    }

    console.log("Creating product in database...");
    const product = new Product({ name, price, description, category, image: imageUrl });
    await product.save();
    console.log("Product saved successfully:", product);

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    console.error("Error in addProduct:", error);
    throw error;
  }
};

const updateProduct = async (req, res) => {
  let updateData = req.body;

  if (req.file) {
    const newImageUrl = await uploadToCloudinary(req.file.buffer);
    updateData.image = newImageUrl;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!updated) throw new AppError("Product not found", 404);

  res.json({ success: true, message: "Product updated", product: updated });
};

const deleteProduct = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) throw new AppError("Product not found", 404);

  res.json({ success: true, message: "Product deleted" });
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
