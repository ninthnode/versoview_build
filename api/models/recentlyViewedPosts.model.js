const mongoose = require("mongoose");

const recentlyViewedPostsSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
			},
		],
	},
	{
		timestamps: true,
	},
);

const RecentlyViewedPosts = mongoose.model(
	"recentlyViewedPosts",
	recentlyViewedPostsSchema,
);

module.exports = { RecentlyViewedPosts };
