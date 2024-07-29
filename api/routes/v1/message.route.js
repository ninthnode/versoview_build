const express = require("express");
const Message = require("../../models/message.model");
const router = express.Router();

router.get("/:senderId/:receiverId", async (req, res) => {
	const { senderId, receiverId } = req.params;

	try {
		const conversation = await Message.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (conversation) {
			res.json(conversation.messages);
		} else {
			res.json([]);
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

module.exports = router;
