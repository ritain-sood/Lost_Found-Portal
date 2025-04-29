const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { Authentication } = require("./routes/jwtAuth");
const { getDB } = require("./routes/mongodb");

// Parse JSON and urlencoded bodies BEFORE routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const notifyRoutes = require("./routes/notify");
const server = http.createServer(app);
const io = new Server(server);

const SECRET_KEY = "your_secret_key";

app.use("/notify", notifyRoutes);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cookieParser());
app.use(express.static("./public"));

const authenticationRoutes = require("./routes/authentication");
const apiReports = require("./routes/reports");
const crudRoutes = require("./routes/crud");
const chatRoutes = require("./routes/chat")(io); // Pass the Socket.IO instance

app.use("/auth", authenticationRoutes);
app.use("/api", apiReports);
app.use("/chat", chatRoutes); // Use the chat routes
app.use("/user",crudRoutes);
app.use(express.static(path.join(__dirname, "Frontend")));

// Serve the dashboard
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Frontend/dashboard.html");
});

// Serve the lostfound page
app.get("/lostfound",Authentication, (req, res) => {
  res.sendFile(__dirname + "/Frontend/lostfound.html");
});

app.get("/lostfound.js",Authentication, (req, res) => {
  res.sendFile(__dirname + "/Frontend/lostfound.js");
});

app.get("/dashboard.js", (req, res) => {
  res.sendFile(__dirname + "/Frontend/dashboard.js");
});

app.get("/dashboard", Authentication, (req, res) => {
  res.sendFile(__dirname + "/Frontend/lfdashboard.html");
});

// Serve the messages page
app.get("/messages", Authentication, (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "messages.html"));
});

// Serve the chat page
app.get("/chat", Authentication, (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "chat.html"));
});

app.get("/profile", Authentication, (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "profile.html"));
});


app.get("/profile.js", Authentication, (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "profile.js"));
});



// Get user ID from auth token
app.get("/auth/getUserId", (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    console.error("No auth token found in cookies.");
    return res.status(401).json({ error: "User not logged in" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded user ID:", decoded.username); // Debugging
    res.json({ userId: decoded.username });
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(403).json({ error: "Invalid or expired token." });
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/auth/login");
});

// Start the server
server.listen(3000, () => console.log("Server running on port 3000"));