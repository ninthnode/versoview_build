const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
	{
		votingUserId: {
			type: String,
			required: true,
		},
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		voteType: {
			type: Boolean,
		},
	},
	{
		timestamps: true,
	},
);

const Vote = mongoose.model("Vote", voteSchema);

module.exports = { Vote };
