const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
	participants: {
		type: [String],
		required: true,
	},
	messages: [
		{
			senderId: String,
			receiverId: String,
			message: String,
			timestamp: { type: Date, default: Date.now },
			read: { type: Boolean, default: false },
		},
	],
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
