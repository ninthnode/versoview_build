const express = require("express");
const {
	create,
	getAllChannel,
	getChannelByName,
	updateChannel,
	deleteChannel,
	followChannel,
	unfollowChannel,
	getChannelById,
	followChannelList,
	pinChannel,
	unpinChannel,
	getFollowChannel,
	followersList,
	doesChannelExist,
} = require("../../controllers/channel.controller");
const { protectUser } = require("../../middlewares/authMiddleware");
const { upload } = require("../../config/multerUpload");
const router = express.Router();

router.post("/createChannel", protectUser, create);
router.get("/getAllChannel", getAllChannel);
router.get("/getChannelByName", protectUser, getChannelByName);

// ryan
router.get("/doesChannelExist/:channelName", doesChannelExist);

router.get("/getChannel/:_id", getChannelById);
router.put("/updateChannel/:_id", protectUser, updateChannel);
router.delete("/deleteChannel/:_id", protectUser, deleteChannel);
router.post("/followChannel/:_id", protectUser, followChannel);
router.get("/followChannelList", protectUser, followChannelList);
router.get("/followersList/:_id", protectUser, followersList);
router.delete("/unfollowChannel/:_id", protectUser, unfollowChannel);
router.get("/getFollowChannel/:_id", protectUser, getFollowChannel);
router.put("/pinChannel/:_id", protectUser, pinChannel);
router.put("/unpinChannel/:_id", protectUser, unpinChannel);

module.exports = router;
