const mongodb = require("mongodb");
const client = new mongodb.MongoClient(
  "mongodb+srv://lostfoundportal:12345@cluster0.rznuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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
