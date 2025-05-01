const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

// For redirecting if already logged in
function Authentication(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("Authenticated User:", req.user);
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.clearCookie("authToken");
    return res.redirect("/auth/login");
  }
}

function redirectIfAuthenticated(req, res, next) {
  const token = req.cookies.authToken;

  if (token) {
    try {
      jwt.verify(token, SECRET_KEY);
      return res.redirect("/dashboard"); // Redirect to dashboard if already logged in
    } catch (err) {
      console.error("Invalid token:", err);
      res.clearCookie("authToken");
    }
  }

  next(); // Proceed to the next middleware if not authenticated
}
  
  module.exports = {
    Authentication,
    redirectIfAuthenticated,
  };