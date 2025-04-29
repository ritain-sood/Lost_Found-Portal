const express = require("express");
const router = express.Router();
const { getDB, ObjectId } = require("./mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const moment = require("moment-timezone");
const { notifyMatchingUsers } = require("./notify"); // <-- Import the notification function
const nodemailer = require("nodemailer"); // Add at the top if not present

// Setup upload directory
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "_")),
});

const upload = multer({ storage });

// Handle report submissions
router.post("/reports", upload.single("item_image"), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging
    console.log("Uploaded File:", req.file); // Debugging

    const dbinstance = getDB();
    const {
      status,
      location,
      category,
      item_name,
      item_description,
      reporter_name,
      reporter_email,
      reporter_contact,
      terms,
      custom_date
    } = req.body;

    // Validate required fields
    if (!status || !location || !category || !item_name || !item_description || 
        !reporter_name || !reporter_email || !reporter_contact) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Handle date selection
    let reportedDate;
    if (req.body.date === "today") {
      reportedDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    } else if (req.body.date === "yesterday") {
      reportedDate = moment()
        .tz("Asia/Kolkata")
        .subtract(1, "day")
        .format("YYYY-MM-DD");
    } else if (req.body.date === "day_before_yesterday") {
      reportedDate = moment()
        .tz("Asia/Kolkata")
        .subtract(2, "days")
        .format("YYYY-MM-DD");
    } else {
      reportedDate = custom_date || moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    }

    const image = req.file ? "/uploads/" + req.file.filename : null;

    const newItem = {
      status,
      location,
      reportedDate,
      category,
      item_name,
      item_description,
      image,
      reporter_name,
      reporter_email,
      reporter_contact,
      terms: terms === "accepted",
      createdAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log("Inserting new item:", newItem); // Debugging

    const result = await dbinstance.collection("items").insertOne(newItem);

    // Notify matching users (Lost <-> Found)
    if (result.insertedId) {
      notifyMatchingUsers(newItem, dbinstance);
    }

    if (result.insertedId) {
      res.json({ success: true, message: "Item reported successfully" });
    } else {
      throw new Error("Failed to insert item into database");
    }
  } catch (error) {
    console.error("Error in report submission:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred while processing your request" 
    });
  }
});

// Fetch all items
router.get("/items", async (req, res) => {
  try {
    const dbinstance = getDB();
    const items = await dbinstance.collection("items").find().toArray();
    res.json(items); // Return JSON array
  } catch (error) {
    res.status(500).json({ error: "Error fetching items: " + error.message });
  }
});

// Fetch user details
router.get("/userDetails", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const db = getDB();
    const user = await db.collection("users").findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ fullName: `${user.firstname} ${user.lastname}` });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});



// ...existing code...

// Feedback endpoint
// ...existing code...

// ...existing code...

// Feedback endpoint
// router.post("/send-feedback", async (req, res) => {
//   try {
//     const { itemId, feedback } = req.body;
//     if (!feedback) return res.status(400).json({ success: false, message: "Feedback required" });

//     // Optionally, fetch user/item info for context
//     const db = getDB();
//     const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });

//     // Send feedback via email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.NOTIFY_EMAIL_USER,
//         pass: process.env.NOTIFY_EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.NOTIFY_EMAIL_USER,
//       to: process.env.NOTIFY_EMAIL_USER, // Send to your admin/support email
//       subject: "Lost & Found Portal - User Feedback",
//       text: `Feedback for item: ${item ? item.item_name : "Unknown"} (${itemId})
// User: ${item ? item.reporter_name + " <" + item.reporter_email + ">" : "Unknown"}
// ---
// ${feedback}
// `,
//     });

//     res.json({ success: true, message: "Feedback sent" });
//   } catch (err) {
//     console.error("Error sending feedback:", err);
//     res.status(500).json({ success: false, message: "Failed to send feedback" });
//   }
// });

// ...existing code...
module.exports = router;