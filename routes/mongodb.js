const mongodb = require("mongodb");
require('dotenv').config();

const client = new mongodb.MongoClient(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

let dbinstance;

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected");
    dbinstance = client.db("LostFound");
  } catch (e) {
    console.error("MongoDB Connection Error:", e);
  }
}

// Call the function to connect to MongoDB when the server starts
connectDB();

function getDB() {
  if (!dbinstance) {
    throw new Error("Database not initialized. Wait for connection.");
  }
  return dbinstance;
}

module.exports = { getDB, ObjectId: mongodb.ObjectId };