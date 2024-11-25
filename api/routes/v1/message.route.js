const express = require("express");
const Message = require("../../models/message.model");
const router = express.Router();
const { protectUser } = require("../../middlewares/authMiddleware");



const markMessagesAsRead = async (conversationId, userId) => {
    await Message.updateOne(
        { _id: conversationId, "messages.senderId": { $ne: userId } },
        { $set: { "messages.$[msg].read": true } },
        { arrayFilters: [{ "msg.read": false }] }
    );
};

const getUnreadMessageCount = async (userId) => {
    const conversations = await Message.aggregate([
        { $match: { participants: userId } },
        { $unwind: "$messages" },
        {
            $match: {
                "messages.read": false,
                "messages.senderId": { $ne: userId },
            },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    return conversations[0]?.count || 0;
};
router.get("/chat/:senderId/:receiverId",protectUser, async (req, res) => {
	const { senderId, receiverId } = req.params;

	try {
		const conversation = await Message.findOne({
			participants: { $all: [senderId, receiverId] },
		});
		await markMessagesAsRead(conversation._id, senderId);

		if (conversation) {
			res.json(conversation.messages);
		} else {
			res.json([]);
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

router.get("/unread/:userId", protectUser,async (req, res) => {
    const { userId } = req.params;

    try {
        const count = await getUnreadMessageCount(userId);
        res.status(200).send({ unreadCount: count });
    } catch (error) {
        res.status(500).send({ error: "Error fetching unread message count" });
    }
});



router.get("/recent-chats/:userId",protectUser, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const chats = await Message.aggregate([
        {
          $match: {
            participants: userId,
          },
        },
        {
          $project: {
            participants: 1,
            messages: { $slice: ["$messages", -1] },
          },
        },
        {
          $sort: { "messages.timestamp": -1 },
        },
      ]);
  
      const recentChats = chats.map((chat) => {
        const lastMessage = chat.messages[0];
        return {
          participants: chat.participants.filter((id) => id !== userId),
          lastMessage: {
            senderId: lastMessage.senderId,
            message: lastMessage.message,
            timestamp: lastMessage.timestamp,
            read: lastMessage.read,
          },
        };
      });
  
      res.status(200).json({ success: true, data: recentChats });
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  
module.exports = router;
