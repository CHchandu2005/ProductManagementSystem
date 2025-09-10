const multer = require("multer");
const AppError = require("../utils/errorHandler");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new AppError("Only image files are allowed", 400), false);
  },
});

module.exports = upload;
