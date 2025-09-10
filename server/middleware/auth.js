const jwt = require("jsonwebtoken");
const AppError = require("../utils/errorHandler");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) throw new AppError("No token, authorization denied", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new AppError("Access denied", 403);

  req.user = decoded;
  next();
};

module.exports = auth;
