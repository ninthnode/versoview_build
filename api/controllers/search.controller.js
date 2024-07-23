const asyncHandler = require("express-async-handler");
const Message  = require("../models/message.model");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");

module.exports.searchArticles = asyncHandler(async (req, res) => {
	try {
		const query = req.params.article;
		console.log({ query });

		const searchedChannels = await Post.aggregate().search({
			text: {
				query,
				path: { wildcard: "*" },
			},
			index: "idx_channelName",
		});

		if (!searchedChannels)
			return res
				.status(400)
				.json({ status: 404, message: "No channels matched this search" });

		return res.status(200).json({ status: 200, data: searchedChannels });
		// db.channels.aggregate([{ $search: {text: {path: {wildcard: '*'}, query: '@ryan'}, index: 'idx_channelName'}}])
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports.searchUsers = asyncHandler(async (req, res) => {
	try {
		const query = req.params.user;
		console.log({ query });

		const searchedChannels = await User.aggregate().search({
			text: {
				query,
				path: { wildcard: "*" },
			},
			index: "idx_channelName",
		});

		if (!searchedChannels)
			return res
				.status(400)
				.json({ status: 404, message: "No channels matched this search" });

		return res.status(200).json({ status: 200, data: searchedChannels });
		// db.channels.aggregate([{ $search: {text: {path: {wildcard: '*'}, query: '@ryan'}, index: 'idx_channelName'}}])
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports.searchMessages = asyncHandler(async (req, res) => {
	try {
		const query = req.params.message;
		console.log({ query });

		const searchedChannels = await Message.aggregate().search({
			text: {
				query,
				path: { wildcard: "*" },
			},
			index: "idx_channelName",
		});

		if (!searchedChannels)
			return res
				.status(400)
				.json({ status: 404, message: "No channels matched this search" });

		return res.status(200).json({ status: 200, data: searchedChannels });
		// db.channels.aggregate([{ $search: {text: {path: {wildcard: '*'}, query: '@ryan'}, index: 'idx_channelName'}}])
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
