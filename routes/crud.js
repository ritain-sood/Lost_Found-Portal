const express = require("express");
const router = express.Router();
const path = require("path");
const { getDB } = require("./mongodb");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { Authentication } = require("./jwtAuth");

// Backend code that sends the user's email in the response

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



module.exports = router;
