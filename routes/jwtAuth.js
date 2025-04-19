// middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

function Authentication(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.clearCookie("authToken");
    return res.redirect("/auth/login");
  }
}

// For redirecting if already logged in
function Authentication(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("Authenticated User:", req.user); // Debugging
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