const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
	{
		rewardName: {
			type: String,
			required: true,
		},
		pointsGained: {
			type: Number,
		},
	},
	{
		timestamps: true,
	},
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = { Reward };
