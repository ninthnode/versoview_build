const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			// required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isBookmarked: {
			type: Boolean,
			default: true,
		},
		postCommentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PostComment",
		},
		editionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PostComment",
		},
	},
	{
		timestamps: true,
	},
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = { Bookmark };
