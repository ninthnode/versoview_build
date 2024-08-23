const asyncHandler = require("express-async-handler");
const Message = require("../models/message.model");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");

module.exports.searchArticles = asyncHandler(async (req, res) => {
  try {
    const query = req.params.article;

    // Return an error if the query is invalid or empty
    if (!query || query.length === 0) {
      return res.status(400).json({ status: 400, message: "Invalid search query" });
    }

    // Use regular expressions to match the exact word
    const searchConditions = {
      // $or: [
      //   { header: { $regex: `\\b${query}\\b`, $options: "i" } },
      //   { section: { $regex: `\\b${query}\\b`, $options: "i" } },
      //   { subSection: { $regex: `\\b${query}\\b`, $options: "i" } },
      //   { bodyRichText: { $regex: `\\b${query}\\b`, $options: "i" } }
      // ]
      $or: [
        { header: { $regex: query, $options: "i" } },
        { section: { $regex: query, $options: "i" } },
        { subSection: { $regex: query, $options: "i" } },
        { bodyRichText: { $regex: query, $options: "i" } }
      ]
    };

    const searchedPosts = await Post.find(searchConditions).populate("channelId");

    if (!searchedPosts?.length) {
      return res
        .status(404)
        .json({ status: 404, message: "No articles matched this search" });
    }

    return res.status(200).json({ status: 200, data: searchedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.searchUsers = asyncHandler(async (req, res) => {
  try {
    const query = req.params.user;
    console.log('User search: ',  query );
    const searchedUsers = await User.find({
      $or: [
        { channelName: { $regex: new RegExp(query, "i") } },
        { username: { $regex: new RegExp(query, "i") } },
        { email: { $regex: new RegExp(query, "i") } },
      ],
    });
    if (!searchedUsers)
      return res
        .status(400)
        .json({ status: 404, message: "No channels matched this search" });
    const userIds = searchedUsers.map((user) => user._id);
    
    const channels = await Channel.find({ userId: { $in: userIds } });
    
    const userChannelsMap = channels.reduce((acc, channel) => {
      acc[channel.userId] = channel._id;
      return acc;
    }, {});
    
    // Step 5: Add the channelId to each searchedUser
    const searchedUsersWithChannels = searchedUsers.map((user) => {
      return {
        ...user.toObject(), // Convert mongoose document to plain object
        channelId: userChannelsMap[user._id], // Add the channelId
      };
    });

  

    return res.status(200).json({ status: 200, data: searchedUsersWithChannels });
    // db.channels.aggregate([{ $search: {text: {path: {wildcard: '*'}, query: '@ryan'}, index: 'idx_channelName'}}])
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.searchMessages = asyncHandler(async (req, res) => {
  try {
    const query = req.params.message;
    console.log('Message Search: ', query);

    const searchedChannels = await Message.aggregate().search({
      text: {
        query,
        path: { wildcard: "*" },
      },
      index: "idx_msgText",
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
