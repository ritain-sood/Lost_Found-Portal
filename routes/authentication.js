const express = require("express");
const router = express.Router();
const path = require("path");
const { getDB } = require("./mongodb");
const jwt = require("jsonwebtoken");


const { Authentication, redirectIfAuthenticated } = require("./jwtAuth");

const SECRET_KEY = "your_secret_key"; // Replace this with a secure key in production



// Serve login page
router.get("/login",redirectIfAuthenticated, (req, res) => {
  const newPath = path.join(__dirname, "/../");
  res.sendFile(newPath + "/Frontend/login.html");
});

// Serve signup page
router.get("/signup",redirectIfAuthenticated, (req, res) => {
  const newPath = path.join(__dirname, "/../");
  res.sendFile(newPath + "/Frontend/signup.html");
});

// Serve JS for frontend
router.get("/lfdashboard.js", (req, res) => {
  const newPath = path.join(__dirname, "/../");
  res.sendFile(newPath + "/Frontend/lfdashboard.js");
});

// Protected route: Dashboard
router.get("/dashboard", Authentication, (req, res) => {
  const newPath = path.join(__dirname, "/../");
  res.sendFile(newPath + "/Frontend/lfdashboard.html");
});

// Handle login
router.post("/checkCred", async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ username: req.body.username });

    if (!user || user.password !== req.body.password) {
      console.log("Invalid credentials");
      return res.redirect("/auth/login");
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("authToken", token, { httpOnly: true });
    console.log("User logged in and token set");

    const redirectUrl = req.body.redirect || "/";
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle signup
router.post("/addCred", async (req, res) => {
  try {
    const db = getDB();
    const existingUser = await db.collection("users").findOne({ username: req.body.username });

    if (existingUser) {
      console.log("User already exists");
      return res.redirect("/auth/login");
    }

    const newUser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username, // email
      phone: req.body.phone,
      password: req.body.password,
      role: "user",
    };

    const result = await db.collection("users").insertOne(newUser);
    console.log("User created:", result.insertedId);
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/check-login", async (req, res) => {
    try {
        const token = req.cookies.authToken; // Get token from cookies
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ user: { username: decoded.username, role: decoded.role } });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});






router.get("/chatUsers", Authentication, async (req, res) => {
  try {
    const db = getDB();
    const currentUserId = req.user.username; // Ensure this is populated
    const chats = await db
      .collection("chats")
      .aggregate([
        { $match: { $or: [{ senderId: currentUserId }, { receiverId: currentUserId }] } },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", currentUserId] },
                "$receiverId",
                "$senderId",
              ],
            },
            lastMessage: { $last: "$message" },
          },
        },
      ])
      .toArray();

    res.json(chats.map((chat) => ({ userId: chat._id, lastMessage: chat.lastMessage })));
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: "Failed to fetch chat users" });
  }
});





// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/auth/login");
});

module.exports = router;
