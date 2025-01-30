const VersoRewardsPoints = require("../models/verso-rewards-points.model");
const { Follow } = require("../models/follow.model");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
const { PostComment } = require("../models/postcomment.model");
const { Vote } = require("../models/vote.model");

const getUserRewardsPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const getAllActionPoints = await VersoRewardsPoints.find();

    let followingArray = [];
    let followerArray = [];
    let postArray = [];
    let editionArray = [];
    let commentArray = [];
    let upvoteArray = [];
    let downvoteArray = [];
    let postReadArray = [];

    const userData = await User.findOne({ _id: userId });

    for (const action of getAllActionPoints) {
      if (action.action === "FOLLOWING") {
        const followedChannels = await Follow.find({ userId }).populate(
          "channelId"
        );

        for (const follow of followedChannels) {
          const channelOwner = follow.channelId.userId;

          // Push the reward entry into the array
          followingArray.push({
            userId: channelOwner,
            name: follow.channelId.channelName,
            action: "FOLLOWING",
            points: action.points,
          });
        }
      }

      if (action.action === "FOLLOWER") {
        const channelData = await Channel.findOne({ userId: userId });
        if (!channelData) continue;
        const followerUsers = await Follow.find({
          channelId: channelData._id,
        }).populate("userId");

        for (const follow of followerUsers) {
          const followerOfChannel = follow.userId._id;

          // Push the reward entry into the array
          followerArray.push({
            userId: followerOfChannel,
            name: follow.userId.channelName,
            points: action.points,
          });
        }
      }
      if (action.action === "CREATE_POST") {
        const postData = await Post.find({ userId: userId });
        if (!postData) continue;

        for (const post of postData) {
          // Push the reward entry into the array
          postArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }
      if (action.action === "CREATE_EDITION") {
        const editionsData = await Edition.find({ userId: userId });
        if (!editionsData) continue;

        for (const edition of editionsData) {
          // Push the reward entry into the array
          editionArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }
      if (action.action === "COMMENT") {
        const commentsData = await PostComment.find({ userId: userId });
        if (!commentsData) continue;

        for (const comment of commentsData) {
          // Push the reward entry into the array
          commentArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }
      if (action.action === "UPVOTE") {
        const upVoteData = await Vote.find({
          votingUserId: userId,
        });
        if (!upVoteData) continue;

        for (const vote of upVoteData) {
          // Push the reward entry into the array
          upvoteArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }
      if (action.action === "DOWNVOTE") {
        const downVoteData = await Vote.find({
          votingUserId: userId,
        });
        if (!downVoteData) continue;

        for (const vote of downVoteData) {
          // Push the reward entry into the array
          downvoteArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }

      if (action.action === "READ_POST") {
        const result = await Post.aggregate([
          { $match: { readBy: userId } }, // Find posts where the user is in readby
          { $count: "postsRead" }, // Count the matching posts
        ]);

        const count = result.length > 0 ? result[0].postsRead : 0;
        for (let i = 0; i < count; i++) {
          postReadArray.push({
            userId: userId,
            name: userData.channelName,
            points: action.points,
          });
        }
      }
    }

    const mergedArray = mergeMultipleArrays(
      followingArray,
      followerArray,
      postArray,
      editionArray,
      commentArray,
      upvoteArray,
      downvoteArray,
      postReadArray
    );

    const sortedArr = mergedArray.sort((a, b) =>
      a.userId === userId ? -1 : b.userId === userId ? 1 : 0
    );

    res.status(200).json({ message: "Success", data: sortedArr });
  } catch (error) {
    console.error(`Error adding reward log: ${error.message}`);
    throw new Error(`Failed to update reward log: ${error.message}`);
  }
};
const mergeMultipleArrays = (...arrays) => {
  let mergedMap = new Map();

  arrays.flat().forEach(({ userId, name, points }) => {
    if (mergedMap.has(userId)) {
      mergedMap.get(userId).points += points; // Sum points for existing user
    } else {
      mergedMap.set(userId, { userId, name, points }); // Add new user
    }
  });

  return Array.from(mergedMap.values());
};

const PopulatePoints = async () => {
  try {
    const actions = [
      "CREATE_POST",
      "CREATE_EDITION",
      "READ_POST",
      "COMMENT",
      "UPVOTE",
      "DOWNVOTE",
      "FOLLOWING",
      "FOLLOWER",
    ];

    for (const action of actions) {
      const exists = await VersoRewardsPoints.findOne({ action });
      if (!exists) {
        await VersoRewardsPoints.create({ action, points: 1 });
        console.log(`Added action: ${action} with points: 1`);
      }
    }
    console.log("Actions populated successfully.");
    return null;
  } catch (error) {
    console.error(`Error adding reward log: ${error.message}`);
    throw error;
  }
};

module.exports = { PopulatePoints, getUserRewardsPoints };
