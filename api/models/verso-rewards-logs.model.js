const mongoose = require('mongoose');

const VersoRewardsLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'CREATE_POST', // User created a post
        'CREATE_EDITION', // User created an edition
        'READ_POST', // User read a post
        'COMMENT', // User commented on a post
        'UPVOTE', // User upvoted a post/comment
        'DOWNVOTE', // User downvoted a post/comment
        'FOLLOW', // User subscribed to another user/channel
      ],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1, // Each action can have a predefined score
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Target user is always required
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional, as not all actions target another entity
    },
    targetType: {
      type: String,
      enum: ['POST', 'COMMENT', 'EDITION', 'CHANNEL'], // Type of the target
      required: false, // Optional, for cases where there’s no associated entity
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const VersoRewardsLog = mongoose.model('VersoRewardsLog', VersoRewardsLogSchema);

module.exports = VersoRewardsLog;
