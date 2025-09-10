const express = require("express");
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", auth, upload.single("image"), addProduct);
router.put("/:id", auth, upload.single("image"), updateProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
