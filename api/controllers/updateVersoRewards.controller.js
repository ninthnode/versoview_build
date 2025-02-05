const VersoRewardsPoints = require("../models/verso-rewards-points.model");
const { Follow } = require("../models/follow.model");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
const { PostComment } = require("../models/postcomment.model");
const { Vote } = require("../models/vote.model");
const { Bookmark } = require("../models/bookmark.model");

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
    let bookmarkArray = [];

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
            avatar: follow.channelId.channelIconImageUrl,
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
            avatar: follow.userId.profileImageUrl,
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
            avatar: userData.profileImageUrl,
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
            avatar: userData.profileImageUrl,
            points: action.points,
          });
        }
      }
      if (action.action === "COMMENT") {
        const commentsData = await PostComment.find({
          userId: userId,
        }).populate({
          path: "postId",
          populate: {
            path: "userId",
            model: "User",
          },
        });

        if (!commentsData) continue;
        for (const comment of commentsData) {
          commentArray.push({
            userId: comment.postId?.userId?._id,
            name: comment.postId?.userId?.channelName,
            avatar: comment.postId?.userId?.profileImageUrl,
            points: action.points,
          });
        }
      }
      if (action.action === "UPVOTE") {
        const upVoteData = await Vote.find({
          votingUserId: userId,
          voteType: true,
        }).populate({
          path: "postId",
          populate: {
            path: "userId",
            model: "User",
          },
        });
        if (!upVoteData) continue;

        for (const vote of upVoteData) {
          upvoteArray.push({
            userId: vote.postId?.userId?._id,
            name: vote.postId?.userId?.channelName,
            avatar: vote.postId?.userId?.profileImageUrl,
            points: action.points,
          });
        }
      }
      if (action.action === "DOWNVOTE") {
        const downVoteData = await Vote.find({
          votingUserId: userId,
          voteType: false,
        }).populate({
          path: "postId",
          populate: {
            path: "userId",
            model: "User",
          },
        });
        if (!downVoteData) continue;

        for (const vote of downVoteData) {
          // Push the reward entry into the array
          downvoteArray.push({
            userId: vote.postId?.userId?._id,
            name: vote.postId?.userId?.channelName,
            avatar: vote.postId?.userId?.profileImageUrl,
            points: action.points,
          });
        }
      }
      if (action.action === "READ_POST") {
        const readPoints = await Post.aggregate([
          { $match: { readBy: userId } }, // Find posts read by this user
          {
            $lookup: {
              from: "users", // Collection name for users
              localField: "userId", // The field in Post that references User
              foreignField: "_id", // The field in User that matches userId
              as: "authorDetails",
            },
          },
          { $unwind: "$authorDetails" }, // Convert array into object
          { 
            $group: { 
              _id: "$authorDetails._id",
              userId: { $first: "$authorDetails._id" }, 
              name: { $first: "$authorDetails.channelName" },
              avatar: { $first: "$authorDetails.profileImageUrl" },
              postCount: { $sum: 1 } // Count how many posts by this author were read
            } 
          }
        ]);
      
        postReadArray = readPoints.map((post) => ({
          ...post, // Spread existing properties
          points: post.postCount * action.points, // Calculate correct points
        }));
      
        // Aggregate user points correctly
        const aggregatedUsers = postReadArray.reduce((acc, user) => {
          if (!acc[user.userId]) {
            acc[user.userId] = { ...user, points: 0 }; // Initialize user in accumulator
          }
          acc[user.userId].points += user.points || 0; // Add points (handle undefined)
          return acc;
        }, {});
      
        postReadArray = Object.values(aggregatedUsers);
      }
      if (action.action === "BOOKMARK") {
        const bookmarkData = await Bookmark.find({
          userId
        }).populate({
          path: "postId",
          populate: {
            path: "userId",
            model: "User",
          },
        });
        for (const bookmark of bookmarkData) {
          bookmarkArray.push({
            userId: bookmark.postId?.userId?._id,
            name: bookmark.postId?.userId?.channelName,
            avatar: bookmark.postId?.userId?.profileImageUrl,
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
      postReadArray,
      bookmarkArray
    );
    const sortedArr = mergedArray.sort((a, b) =>
      a.userId.toString() === userId.toString() ? -1 : b.userId.toString() === userId.toString() ? 1 : 0
    );

    res.status(200).json({ message: "Success", data: sortedArr });
  } catch (error) {
    console.error(`Error adding reward log: ${error.message}`);
    throw new Error(`Failed to update reward log: ${error.message}`);
  }
};
const mergeMultipleArrays = (...arrays) => {
  let mergedMap = new Map();

  arrays.flat().forEach(({ userId, name,avatar, points }) => {
    if (!userId) return;
    const key = userId.toString();
    if (mergedMap.has(key)) {
      // Update the existing entry by adding points
      mergedMap.get(key).points += points;
    } else {
      // Add a new entry
      mergedMap.set(key, { userId, name,avatar, points: points });
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
