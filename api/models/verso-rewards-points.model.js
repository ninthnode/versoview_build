const mongoose = require('mongoose');

const VersoRewardsPointsSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE_POST','CREATE_EDITION', 'READ_POST', 'COMMENT', 'UPVOTE', 'DOWNVOTE', 'FOLLOWING',"FOLLOWER",'BOOKMARK'],
    unique: true,
  },
  points: {
    type: Number,
    required: true,
    default: 0, // Default points value
    min: 0, // Ensures points are non-negative
  },
});

const VersoRewardsPoints = mongoose.model('VersoRewardsPoints', VersoRewardsPointsSchema);

module.exports = VersoRewardsPoints;
