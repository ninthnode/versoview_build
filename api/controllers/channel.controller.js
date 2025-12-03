const asyncHandler = require("express-async-handler");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model");
const { Follow } = require("../models/follow.model");
const { User } = require("../models/user.model");
const { Edition } = require("../models/edition.model");
const { logRewardAction } = require("../utils/rewardLogger");

// Create Channel
module.exports.create = asyncHandler(async (req, res) => {
	try {
		const existingEmailChannel = await Channel.findOne({
			email: req.body.email,
		});
		if (existingEmailChannel) {
			return res.status(200).json({
				status: 400,
				message: "Channel with this email already exists",
			});
		}

		const existingNameChannel = await Channel.findOne({
			channelName: req.body.channelName,
		});

		if (existingNameChannel) {
			return res.status(200).json({
				status: 400,
				message: "Channel with this name already exists",
			});
		}

		const userId = req.user._id;

		const channelData = {
			userId,
			channelName: `@${req.body.channelName}`,
			about: req.body.about || "",
			genre: req.body.genre || "",
			subGenre: req.body.subGenre || "",
			profileHandle: req.body.profileHandle || "",
			profileTitle: req.body.profileTitle || "",
			url: req.body.url || "",
			email: req.body.email || "",
			phone: req.body.phone || "",
			location: req.body.location || "",
			backgroundColor: req.body.backgroundColor || "",
			// wallpaperImageUrl: req.body.wallpaperImageUrl,
			channelIconImageUrl: req.body.channelIconImageUrl || "",
			status: req.body.status,
		};

		const newChannel = new Channel(channelData);
		await newChannel.save();

		res.status(201);
		res.json({
			status: 201,
			message: "Channel created successfully",
			data: newChannel,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports.getAllChannel = asyncHandler(async (req, res) => {
	try {
	  const userId = req.user._id;
	//   sort by pinned
	//   const userFollows = await Follow.find({ userId }).sort({ pinned: -1 }).exec();
	  const userFollows = await Follow.find({ userId: userId }).sort({ pinned: -1 }).exec();
	  console.log(userFollows)
	  let followedChannelIds = userFollows.map((follow) => follow.channelId);
  
	  // Add a hardcoded channel ID to the list
	  const hardcodedChannelId = process.env.ADMIN_CHANNEL_ID; // Replace with your hardcoded ID
	//   if (!followedChannelIds.includes(hardcodedChannelId)) {
	// 	followedChannelIds.push(hardcodedChannelId);
	//   }
  
	  let channelData = await Channel.find({
		_id: { $in: followedChannelIds },
		status: { $ne: 'suspended' } // Filter out suspended channels at query level
	  });
	  channelData = followedChannelIds.map((id) => channelData.find((channel) => channel._id.equals(id))).filter(channel => channel !== undefined);

	  const userChannel = await Channel.find({
		userId: userId,
		status: { $ne: 'suspended' } // Filter out suspended channels at query level
	  });

	  let combinedChannel = [...userChannel, ...channelData];

	  const uniqueChannels = Array.from(
		new Map(combinedChannel.map((channel) => [channel._id.toString(), channel])).values()
	  );
  
	  // Ensure the hardcoded channel is at the top
	  let sortedChannels = uniqueChannels;
	  if (hardcodedChannelId) {
		const hardcodedChannel = uniqueChannels.find((channel) =>
		  channel._id.equals(hardcodedChannelId)
		);
		const otherChannels = uniqueChannels.filter(
		  (channel) => !channel._id.equals(hardcodedChannelId)
		);
		sortedChannels = hardcodedChannel ? [hardcodedChannel, ...otherChannels] : uniqueChannels;
	  }
  
	  res.status(200).json({ message: "Success", data: sortedChannels });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  });
  
module.exports.getAllChannelLoggedoutUser = asyncHandler(async (req, res) => {
	try {
		const adminId = process.env.ADMIN_USER_ID;
		const userData = await User.findById(adminId);
		const channelData = await Channel.find({userId: userData._id});

		res.status(200).json({ message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get channel by Id
module.exports.getChannelById = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;
		const channelData = await Channel.findOne({ username: channelId }).populate({
			path: 'userId',
			select: 'genre'
		  });

		res.status(200);
		res.json({ message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


module.exports.getChannelByUserId = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id;
		console.log(userId)
		const channelData = await Channel.findOne({ userId:userId });

		res.status(200);
		res.json({ message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get channel detail
module.exports.getChannelByName = asyncHandler(async (req, res) => {
	try {
		const channelName = req.user.channelName;
		const channelData = await Channel.findOne({ channelName });

		res.status(200);
		res.json({ message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Check if Channel exists
module.exports.doesChannelExist = asyncHandler(async (req, res) => {
	try {
		const channelName = req.params.channelName;
		const channelData = await Channel.findOne({ channelName });

		res.status(200);
		res.json({ message: "Success", data: Boolean(channelData) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Update channel
module.exports.updateChannel = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;
		const channelData = await Channel.findOne({ _id: channelId });

		if (!channelData) {
			return res
				.status(200)
				.json({ status: 404, message: "Channel not found" });
		}

		const updatedChannel = await Channel.findByIdAndUpdate(
			channelId,
			req.body,
			{
				new: true,
			},
		);

		res.status(200).json({
			status: 200,
			message: "Channel updated successfully",
			data: updatedChannel,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Delete channel
module.exports.deleteChannel = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;

		const channelToDelete = await Channel.findById(channelId);

		if (!channelToDelete) {
			return res.status(404).json({ error: "Channel not found" });
		}

		await channelToDelete.deleteOne();

		res
			.status(200)
			.json({ message: "Channel deleted successfully", data: channelToDelete });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get Follow Channel
module.exports.getFollowChannel = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id;
		const channelId = req.params._id;
		console.log(channelId, "channelId");
		console.log(userId, "userID");
		const channelData = await Follow.findOne({
			userId: userId,
			channelId: channelId,
		});

		return res
			.status(200)
			.json({ status: 200, message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

// Follow Channel List
module.exports.followChannelList = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id;
		const channelData = await Follow.find({ userId }).populate({
			path: "channelId",
			populate: {
				path: "userId",
				model: "User",
			},
		});

		// Filter out follows of suspended channels
		const activeChannelData = channelData.filter(follow =>
			follow.channelId && follow.channelId.status !== 'suspended'
		);

		return res
			.status(200)
			.json({ status: 200, message: "Success", data: activeChannelData });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

// Followers Channel List
module.exports.followersList = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;
		const channelData = await Follow.find({ channelId: channelId }).populate(
			"channelId",
		);

		return res
			.status(200)
			.json({ status: 200, message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});
module.exports.followingList = asyncHandler(async (req, res) => {
	try {
		const userId = req.params._id;
		const channelData = await Follow.find({ userId }).populate(
			"channelId",
		);

		return res
			.status(200)
			.json({ status: 200, message: "Success", data: channelData });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

// Follow Channel
module.exports.followChannel = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id;
		const channelId = req.params._id;
		const { status } = req.body;

		const channel = {
			userId,
			channelId,
			status,
		};

		const isChannelAlreadyFollowed = await Follow.findOne({
			channelId: channelId,
			userId: userId,
		});
		if (isChannelAlreadyFollowed) {
			return res.status(200).json({
				status: 400,
				message: "Channel already followed",
				data: isChannelAlreadyFollowed,
			});
		}

		const followChannel = new Follow(channel);
		await followChannel.save();

		// Get channel owner to log rewards
		const channelData = await Channel.findById(channelId);
		if (channelData) {
			// Log reward for following - both follower and channel owner get points
			await logRewardAction({
				userId: userId,
				action: 'FOLLOWING',
				targetUserId: userId, // User following gets points
				targetId: channelId,
				targetType: 'CHANNEL'
			});

			await logRewardAction({
				userId: userId,
				action: 'FOLLOWER',
				targetUserId: channelData.userId, // Channel owner gets points
				targetId: channelId,
				targetType: 'CHANNEL'
			});
		}

		return res
			.status(201)
			.json({ status: 201, message: "Channel followed", data: followChannel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Unfollow channel
module.exports.unfollowChannel = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id;
		const channelId = req.params._id;
		const unfollowChannel = await Follow.findOne({
			channelId: channelId,
			userId: userId,
		});

		if (!unfollowChannel) {
			return res
				.status(200)
				.json({ status: 404, message: "Channel not found" });
		}
		await Follow.deleteOne({ _id: unfollowChannel._id });
		return res.status(200).json({
			status: 200,
			message: "Channel unfollowed",
			data: unfollowChannel,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Pinned channel
module.exports.pinChannel = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;
		const userId = req.user._id;
		const updatedFollow = await Follow.findOneAndUpdate(
			{ channelId: channelId,userId: userId },
			{ pinned: true },
			{ new: true }
		);

		if (!updatedFollow)
			return res
				.status(200)
				.json({ status: 404, message: "Follow document not found" });

		return res.status(200).json({ status: 200, data: updatedFollow });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Channel unpinned
module.exports.unpinChannel = asyncHandler(async (req, res) => {
	try {
		const channelId = req.params._id;
		const userId = req.user._id;

		const updatedFollow = await Follow.findOneAndUpdate(
			{ channelId: channelId,userId: userId },
			{ pinned: false },
			{ new: true }
		);

		if (!updatedFollow)
			return res
				.status(200)
				.json({ status: 404, message: "Follow document not found" });

		return res.status(200).json({ status: 200, data: updatedFollow });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


module.exports.getChannelByEditionId = asyncHandler(async (req, res) => {
    try {
      const editionId = req.params._id;
      const editionData = await Edition.findOne({ _id: editionId });
      const channelData = await Channel.findOne({ userId: editionData.userId }).populate({
		path: 'userId',
		select: 'genre'
	  });
      if (!editionData) {
        console.log(`edition not found for ID: ${editionId}`);
        return res.status(404).json({ message: "edition not found" });
      }

      res.status(200).json({ message: "Success", data: {channelData,editionData} });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Suspend Channel (Admin only)
module.exports.suspendChannel = asyncHandler(async (req, res) => {
	try {
		const adminUserId = process.env.ADMIN_USER_ID;
		const currentUserId = req.user._id.toString();

		// Check if current user is admin
		if (currentUserId !== adminUserId) {
			return res.status(403).json({
				status: 403,
				message: "Access denied. Admin privileges required."
			});
		}

		const channelId = req.params._id;
		const channelData = await Channel.findOne({ _id: channelId });

		if (!channelData) {
			return res.status(404).json({
				status: 404,
				message: "Channel not found"
			});
		}

		// Update channel status to suspended
		const updatedChannel = await Channel.findByIdAndUpdate(
			channelId,
			{ status: "suspended" },
			{ new: true }
		);

		res.status(200).json({
			status: 200,
			message: "Channel suspended successfully",
			data: updatedChannel,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Reactivate Channel (Admin only)
module.exports.reactivateChannel = asyncHandler(async (req, res) => {
	try {
		const adminUserId = process.env.ADMIN_USER_ID;
		const currentUserId = req.user._id.toString();

		// Check if current user is admin
		if (currentUserId !== adminUserId) {
			return res.status(403).json({
				status: 403,
				message: "Access denied. Admin privileges required."
			});
		}

		const channelId = req.params._id;
		const channelData = await Channel.findOne({ _id: channelId });

		if (!channelData) {
			return res.status(404).json({
				status: 404,
				message: "Channel not found"
			});
		}

		// Update channel status to active
		const updatedChannel = await Channel.findByIdAndUpdate(
			channelId,
			{ status: "active" },
			{ new: true }
		);

		res.status(200).json({
			status: 200,
			message: "Channel reactivated successfully",
			data: updatedChannel,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get channel dashboard with pagination (Admin only)
module.exports.getChannelDashboard = asyncHandler(async (req, res) => {
	try {
		const adminUserId = process.env.ADMIN_USER_ID;
		const currentUserId = req.user._id.toString();

		// Check if current user is admin
		if (currentUserId !== adminUserId) {
			return res.status(403).json({
				status: 403,
				message: "Access denied. Admin privileges required."
			});
		}

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		// Get total count of channels
		const totalChannels = await Channel.countDocuments();

		// Get paginated channels with user details
		const channels = await Channel.find()
			.populate('userId', 'firstName lastName email username status')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const totalPages = Math.ceil(totalChannels / limit);

		res.status(200).json({
			status: 200,
			data: {
				channels,
				pagination: {
					currentPage: page,
					totalPages,
					totalChannels,
					limit,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1
				}
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});