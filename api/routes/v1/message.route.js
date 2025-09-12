const express = require("express");
const Message = require("../../models/message.model");
const router = express.Router();
const { protectUser } = require("../../middlewares/authMiddleware");
const {
    getUnreadMessageCount,
    getRecentChats,
    markMessagesAsRead
} = require("../../controllers/message.controller");
  
router.get("/chat/:senderId/:receiverId",protectUser, async (req, res) => {
	const { senderId, receiverId } = req.params;

	try {
		const conversation = await Message.findOne({
			participants: { $all: [senderId, receiverId] },
		});
    if(!conversation)
        return res.status(200).json([]);
		
		// Mark messages as read for the sender (viewer)
		await markMessagesAsRead(conversation._id, senderId);

		// Get updated unread count and emit via socket
		const unreadCount = await getUnreadMessageCount(senderId);
		const io = req.app.get('io');
		const users = req.app.get('connectedUsers');
		if (io && users && users[senderId]) {
			console.log(`Chat endpoint: Emitting unreadCount ${unreadCount} to user ${senderId} via socket ${users[senderId]}`);
			io.to(users[senderId]).emit("unreadCount", unreadCount);
		} else {
			console.log(`Chat endpoint: Cannot emit unreadCount - io: ${!!io}, users: ${!!users}, userSocket: ${users?.[senderId]}`);
		}

		res.json(conversation.messages);
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});



router.get("/unread/:userId", protectUser,async (req, res) => {
    const { userId } = req.params;

    try {
        const count = await getUnreadMessageCount(userId);
        res.status(200).send({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread message count:", error);
        res.status(500).send({ error: "Error fetching unread message count" });
    }
});

// New endpoint to mark messages as read
router.post("/mark-read", protectUser, async (req, res) => {
    const { userId, otherUserId } = req.body;

    try {
        const conversation = await Message.findOne({
            participants: { $all: [userId, otherUserId] },
        });

        if (!conversation) {
            return res.status(200).json({ success: true, message: "No conversation found" });
        }

        await markMessagesAsRead(conversation._id, userId);
        
        // Get updated unread count
        const unreadCount = await getUnreadMessageCount(userId);
        
        res.status(200).json({ 
            success: true, 
            message: "Messages marked as read",
            unreadCount 
        });

        // Emit the updated count via socket if available
        const io = req.app.get('io');
        const users = req.app.get('connectedUsers');
        if (io && users && users[userId]) {
            console.log(`Emitting unreadCount ${unreadCount} to user ${userId} via socket ${users[userId]}`);
            io.to(users[userId]).emit("unreadCount", unreadCount);
        } else {
            console.log(`Cannot emit unreadCount - io: ${!!io}, users: ${!!users}, userSocket: ${users?.[userId]}`);
        }
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});



router.get("/recent-chats/:userId",protectUser, async (req, res) => {
    const { userId } = req.params;

    try {
      const recentChats = await getRecentChats(userId);
      res.status(200).json({ success: true, data: recentChats });
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  
module.exports = router;
