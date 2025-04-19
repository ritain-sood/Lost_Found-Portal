const express = require("express");
const router = express.Router();
const { getDB } = require("./mongodb");
const { Authentication } = require("./jwtAuth");

module.exports = (io) => {
  // Socket.IO for real-time chat
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a room for a specific chat
    socket.on("joinRoom", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        console.error("Invalid senderId or receiverId:", { senderId, receiverId });
        return;
      }

      const roomName = [senderId, receiverId].sort().join("_");
      socket.join(roomName);
      console.log(`${socket.id} joined room: ${roomName}`);
    });

    // Handle personal chat messages
    socket.on("personalMessage", async ({ senderId, receiverId, message }) => {
      if (!senderId || !receiverId) {
        console.error("Invalid senderId or receiverId:", { senderId, receiverId });
        return;
      }

      const roomName = [senderId, receiverId].sort().join("_");

      try {
        const db = getDB();

        const chatMessage = {
          senderId,
          receiverId,
          message,
          roomName,
          timestamp: new Date(),
        };

        // Save the message to the database
        await db.collection("chats").insertOne(chatMessage);

        // Emit the message to the room
        io.to(roomName).emit("personalMessage", {
          senderId,
          message,
          timestamp: chatMessage.timestamp,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  // Create a new chat (if it doesn't already exist)
  router.post("/createChat", Authentication, async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
  
      if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
      }
  
      const roomName = [senderId, receiverId].sort().join("_");
      const db = getDB();
  
      // Check if the chat already exists
      const existingChat = await db.collection("chats").findOne({ roomName });
  
      if (!existingChat) {
        // Create a new chat room
        const chatMessage = {
          senderId,
          receiverId,
          message: "Chat started",
          roomName,
          timestamp: new Date(),
        };
  
        await db.collection("chats").insertOne(chatMessage);
      }
  
      res.status(200).json({ message: "Chat created successfully" });
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ error: "Failed to create chat" });
    }
  });

  // Fetch chat history
  router.get("/chats", Authentication, async (req, res) => {
    try {
      const { receiverId } = req.query;
      const senderId = req.user.username;

      if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is required" });
      }

      const roomName = [senderId, receiverId].sort().join("_");

      const db = getDB();

      // Fetch chat history
      const chats = await db
        .collection("chats")
        .find({ roomName })
        .sort({ timestamp: 1 })
        .toArray();

      const receiver = await db.collection("users").findOne({ username: receiverId });
      const receiverName = receiver ? `${receiver.firstname} ${receiver.lastname}` : receiverId;

      res.json({ chats, receiverName });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Fetch all chat users
  router.get("/chatUsers", Authentication, async (req, res) => {
    try {
      const db = getDB();
      const currentUserId = req.user.username;

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
              lastTimestamp: { $last: "$timestamp" },
            },
          },
        ])
        .toArray();

      const userDetails = await Promise.all(
        chats.map(async (chat) => {
          const user = await db.collection("users").findOne({ username: chat._id });
          return {
            userId: chat._id,
            fullName: user ? `${user.firstname} ${user.lastname}` : chat._id,
            lastMessage: chat.lastMessage,
            lastTimestamp: chat.lastTimestamp,
          };
        })
      );

      res.json(userDetails);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ error: "Failed to fetch chat users" });
    }
  });

  return router;
};