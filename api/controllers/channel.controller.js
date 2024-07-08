const asyncHandler = require("express-async-handler");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model");
const { Follow } = require("../models/follow.model");

// Create Channel
module.exports.create = asyncHandler(async (req, res) => {
  try {
    const existingEmailChannel = await Channel.findOne({ email: req.body.email });
    if (existingEmailChannel) {
      return res.status(200).json({status:400,  message: "Channel with this email already exists" });
    }

    const existingNameChannel = await Channel.findOne({ channelName: req.body.channelName });

    if (existingNameChannel) {
      return res.status(200).json({status:400, message: "Channel with this name already exists" });
    }

    const userId = req.user._id;
   
    const channelData = {
      userId,
      channelName: `@${req.body.channelName}`,
      about: req.body.about || '',
      genre: req.body.genre || '',
      subGenre: req.body.subGenre || '',
      profileHandle: req.body.profileHandle || '',
      profileTitle : req.body.profileTitle || '',
      url: req.body.url || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      location: req.body.location || '',
      backgroundColor: req.body.backgroundColor || '',
      // wallpaperImageUrl: req.body.wallpaperImageUrl,
      channelIconImageUrl: req.body.channelIconImageUrl || '',
      status: req.body.status,
    };

    const newChannel = new Channel(channelData);
    await newChannel.save();

    res.status(201);
    res.json({status:201, message: "Channel created successfully", data: newChannel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getAllChannel = asyncHandler(async (req, res) => {
  try {
    const channelData = await Channel.find();

    // Get total post count for each channel
    const channelsWithPostCount = await Promise.all(
      channelData.map(async (channel) => {
        const postCount = await Post.countDocuments({ channelId: channel._id });
        return {
          channelData: channel.toObject(),
          postCount: postCount
        };
      })
    );

    res.status(200).json({ message: "Success", data: channelsWithPostCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get channel by Id
module.exports.getChannelById = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params._id;
    const channelData = await Channel.findOne({ _id : channelId});
   
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
    const channelData = await Channel.findOne({ channelName : channelName});

    res.status(200);
    res.json({ message: "Success", data: channelData });
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
      return res.status(200).json({status: 404, message: "Channel not found" });
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      req.body,
      {
        new: true,
      }
    );

    res
      .status(200)
      .json({ status: 200, message: "Channel updated successfully", data: updatedChannel });
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

    await channelToDelete.remove();

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
    const channelData = await Follow.findOne({ userId : userId, channelId : channelId});
   
    return res.status(200).json({status : 200,  message: "Success", data: channelData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Follow Channel List
module.exports.followChannelList = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const channelId = req.params._id;
    const channelData = await Follow.find({ userId : userId}).populate("channelId");
   
    return res.status(200).json({status : 200,  message: "Success", data: channelData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Followers Channel List
module.exports.followersList = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const channelId = req.params._id;
    const channelData = await Follow.find({ channelId : channelId}).populate("channelId");
   
    return res.status(200).json({status : 200,  message: "Success", data: channelData });
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
    const {status} = req.body;

    const channel = {
      userId,
      channelId,
      status
    };

    const isChannelAlreadyFollowed = await Follow.findOne({channelId : channelId, userId: userId});
    if(isChannelAlreadyFollowed) {
      return res.status(200).json({status: 400, message: "Channel already followed" , data: isChannelAlreadyFollowed});
    }

    const followChannel = new Follow(channel);
    await followChannel.save();

    return res.status(201).json({status: 201,  message: "Channel followed", data: followChannel });
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
    const unfollowChannel = await Follow.findOne({ channelId: channelId , userId: userId});

    if (!unfollowChannel) {
      return res.status(200).json({status: 404, message: "Channel not found" });
    }

    await unfollowChannel.remove();
    return res.status(200).json({status: 200, message: "Channel unfollowed", data: unfollowChannel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Pinned channel
module.exports.pinnedChannel = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params._id;
    const userId = req.user._id;

    const updatedFollow = await Follow.findOneAndUpdate(
      { channelId: channelId },
      { pinned: true }, 
      { new: true }
    );
   
    if (updatedFollow) {
      return res.status(200).json({status: 200, data : updatedFollow}); 
    } else {
      return res.status(200).json({staus: 404,  message: "Follow document not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Channel unpinned
module.exports.unpinnedChannel = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params._id;
    const userId = req.user._id;

    const updatedFollow = await Follow.findOneAndUpdate(
      { channelId: channelId},
      { pinned: false }, 
      { new: true }
    );

    if (updatedFollow) {
      return res.status(200).json({status: 200, data : updatedFollow}); 
    } else {
      return res.status(200).json({staus: 404,  message: "Follow document not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});