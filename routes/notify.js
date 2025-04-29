const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { getDB, ObjectId } = require("./mongodb");

// Configure your email transporter (use environment variables for real projects)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NOTIFY_EMAIL_USER,
    pass: process.env.NOTIFY_EMAIL_PASS,
  },
});

// Route to notify item owner when contacted
router.post("/notify-owner", async (req, res) => {
  try {
    const { itemId, contactUserEmail } = req.body;
    if (!itemId || !contactUserEmail) {
      return res.status(400).json({ success: false, message: "Missing itemId or contactUserEmail" });
    }

    const db = getDB();
    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Respond to the user immediately
    res.json({ success: true, message: "Notification will be sent to item owner" });

    // Send email in the background
    transporter.sendMail({
      from: process.env.NOTIFY_EMAIL_USER,
      to: item.reporter_email,
      subject: "Someone has contacted you about your Lost & Found item",
      text: `Hello ${item.reporter_name},

Someone has contacted you regarding your listed item: "${item.item_name}".

Contact User Email: ${contactUserEmail}

Please check your messages in the portal for more details.

- Lost & Found Portal Team
      `,
    }).catch(error => {
      console.error("Error sending notification:", error);
    });

  } catch (error) {
    console.error("Error preparing notification:", error);
    res.status(500).json({ success: false, message: "Failed to process notification" });
  }
});

// Function to notify users with matching Lost/Found items
async function notifyMatchingUsers(newItem, db) {
  const oppositeStatus = newItem.status === "Lost" ? "Found" : "Lost";
  // Find items in the opposite category with similar category and location

const matches = await db.collection("items").find({
  status: oppositeStatus,
  category: newItem.category
}).toArray();


for (const match of matches) {
  const mailOptions = {
    from: process.env.NOTIFY_EMAIL_USER,
    to: match.reporter_email,
    subject: `Someone has added an item in the ${newItem.status} category ("${newItem.category}")`,    text: `Hello ${match.reporter_name},

    Someone has added an item in the ${newItem.status} category ("${newItem.category}") that may match your report: "${newItem.item_name}".
    
    Please check the Lost & Found portal for more details.
    
    - Lost & Found Portal Team
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${match.reporter_email}`);
  } catch (err) {
    console.error("Error sending match notification:", err);
  }
}

}

module.exports = router;
module.exports.notifyMatchingUsers = notifyMatchingUsers;