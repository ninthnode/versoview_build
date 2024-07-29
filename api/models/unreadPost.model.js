const mongoose = require("mongoose");

const unreadPostSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		channelId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		readPost: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const UnreadPost = mongoose.model("UnreadPost", unreadPostSchema);

module.exports = { UnreadPost };
