const jwt = require("jsonwebtoken");
const AppError = require("../utils/errorHandler");

const   login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError("Email and password are required", 400);
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ success: true, token });
};

// Verify current token (auth middleware already validates and sets req.user)
const verify = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, verify };
