const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		channelId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Channel",
			required: true,
		},
		status: {
			type: String,
			defualt: "follow",
		},
		pinned: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const Follow = mongoose.model("Follow", followSchema);

module.exports = { Follow };
