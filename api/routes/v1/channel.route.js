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
  pinnedChannel,
  unpinnedChannel,
  getFollowChannel,
  followersList
} = require("../../controllers/channel.controller");
const { protectUser } = require("../../middlewares/authMiddleware");
const { upload } = require("../../config/multerUpload");
const router = express.Router();

router.post("/createChannel", protectUser, create);
router.get("/getAllChannel", getAllChannel);
router.get("/getChannelByName", protectUser, getChannelByName);
router.get("/getChannel/:_id", getChannelById);
router.put("/updateChannel/:_id", protectUser, updateChannel);
router.delete("/deleteChannel/:_id", protectUser, deleteChannel);
router.post("/followChannel/:_id", protectUser, followChannel);
router.get("/followChannelList", protectUser, followChannelList);
router.get("/followersList/:_id", protectUser, followersList);
router.delete("/unfollowChannel/:_id", protectUser, unfollowChannel);
router.get("/getFollowChannel/:_id", protectUser, getFollowChannel);
router.put("/pinnedChannel/:_id", protectUser, pinnedChannel);
router.put("/unpinnedChannel/:_id", protectUser, unpinnedChannel);

module.exports = router;
