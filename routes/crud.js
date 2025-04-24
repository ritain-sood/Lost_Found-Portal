const express = require("express");
const router = express.Router();
const path = require("path");
const { getDB } = require("./mongodb");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { Authentication } = require("./jwtAuth");


// GET route to fetch user profile info
router.get("/profile", Authentication, async (req, res) => {
  const db = getDB();
  const userEmail = req.user.username;

  try {
    const user = await db.collection("users").findOne({ username: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      firstName: user.firstname || "",
      lastName: user.lastname || "",
      email: user.username || "",
      phone: user.phone || "",
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});




// PUT route to update user profile (excluding email)
router.put("/update-profile", Authentication, async (req, res) => {
  const db = getDB();
  const userEmail = req.user.username; // email from JWT
  const { firstName, lastName, phone } = req.body;

  try {
    // First check if user exists
    const user = await db.collection("users").findOne({ username: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const result = await db.collection("users").updateOne(
      { username: userEmail },
      { 
        $set: { 
          firstname: firstName,  // match the database field names
          lastname: lastName,
          phone: phone 
        } 
      }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: "Profile updated successfully" });
    } else if (result.matchedCount === 1 && result.modifiedCount === 0) {
      res.json({ success: false, message: "No changes made" });
    } else {
      res.status(400).json({ success: false, message: "Failed to update profile" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});






// that sends the user's email in the response

router.get("/items", Authentication, async (req, res) => {
    const db = getDB();
    const userEmail = req.user.username; // User's email extracted from JWT
    try {
      const items = await db.collection("items").find({ reporter_email: userEmail }).toArray();
      if (items.length === 0) {
        return res.json({ message: "No Items Listed" });
      }
      res.json({ items, userEmail });  // Include userEmail in the response
    } catch (err) {
      console.error("Error fetching user items:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  

// DELETE route
router.delete("/items/:id", Authentication, async (req, res) => {
  const db = getDB();
  const itemId = req.params.id;
  try {
    const result = await db.collection("items").deleteOne({ _id: new ObjectId(itemId) });
    if (result.deletedCount === 1) {
      res.json({ message: "Item deleted successfully" });
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});


// GET route to fetch a single item by its ID
router.get("/items/:id", Authentication, async (req, res) => {
    const db = getDB();
    const itemId = req.params.id;
    const { item_name, item_description } = req.body;
    try {
      const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });

      if (item) {
        res.json({ item });
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      console.error("Error fetching item:", err);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

// PUT route for editing an item
router.put("/items/:id", Authentication, async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { item_name, item_description, status } = req.body; 
  try {
    const updateFields = { item_name, item_description, status };
    const result = await db.collection("items").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: "Item updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Item not found or no changes made" });
    }
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ success: false, error: "Failed to update item" });
  }
});

// PUT route to change password
router.put("/change-password", Authentication, async (req, res) => {
  const db = getDB();
  const userEmail = req.user.username;
  const { currentPassword, newPassword } = req.body;

  try {
    // First verify the current password
    const user = await db.collection("users").findOne({ username: userEmail });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Update the password
    const result = await db.collection("users").updateOne(
      { username: userEmail },
      { $set: { password: newPassword } }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: "Password updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Failed to update password" });
    }
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
});



router.put("/resolved/:id", Authentication, async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await db.collection("items").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Resolved" } }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: "Item status updated to Resolved" });
    } else {
      res.status(404).json({ success: false, message: "Item not found or no changes made" });
    }
  } catch (err) {
    console.error("Error updating item status:", err);
    res.status(500).json({ success: false, error: "Failed to update item status" });
  }
});


module.exports = router;
