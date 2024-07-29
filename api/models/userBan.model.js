const mongoose = require("mongoose");

const userBanSchema = new mongoose.Schema(
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
	},
	{
		timestamps: true,
	},
);

const UserBan = mongoose.model("UserBan", userBanSchema);

module.exports = { UserBan };
