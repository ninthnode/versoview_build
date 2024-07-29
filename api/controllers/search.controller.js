const asyncHandler = require("express-async-handler");
const Message = require("../models/message.model");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");

module.exports.searchArticles = asyncHandler(async (req, res) => {
  try {
    const query = req.params.article;
    console.log('Article search: ', query);

    const searchedChannels = await Post.find({
      $or: [
        { header: { $regex: new RegExp(query, "i") } },
        { section: { $regex: new RegExp(query, "i") } },
        { subSection: { $regex: new RegExp(query, "i") } },
        { bodyRichText: { $regex: new RegExp(query, "i") } },
      ],
    });

    if (!searchedChannels?.length)
      return res
        .status(400)
        .json({ status: 404, message: "No articles matched this search" });

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
    console.log('User search: ',  query );

    const searchedChannels = await User.find({
      $or: [
        { channelName: { $regex: new RegExp(query, "i") } },
        { username: { $regex: new RegExp(query, "i") } },
        { email: { $regex: new RegExp(query, "i") } },
      ],
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
