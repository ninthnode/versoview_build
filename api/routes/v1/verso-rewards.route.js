const express = require("express");

const {
    getUserRewardsPoints,
    PopulatePoints
} = require("../../controllers/updateVersoRewards.controller");
const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/addPoints", PopulatePoints);
router.get("/getUserRewardsPoints",protectUser, getUserRewardsPoints);

module.exports = router;
