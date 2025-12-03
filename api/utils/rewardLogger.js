const VersoRewardsLog = require('../models/verso-rewards-logs.model');
const VersoRewardsPoints = require('../models/verso-rewards-points.model');

/**
 * Logs a reward action for a user
 * @param {Object} params - The reward logging parameters
 * @param {String} params.userId - The user performing the action
 * @param {String} params.action - The action type (CREATE_POST, COMMENT, UPVOTE, etc.)
 * @param {String} params.targetUserId - The user receiving the reward points
 * @param {String} params.targetId - Optional: The ID of the target entity (post, comment, etc.)
 * @param {String} params.targetType - Optional: The type of target (POST, COMMENT, EDITION, CHANNEL)
 * @returns {Promise<Object>} The created reward log entry
 */
const logRewardAction = async ({ userId, action, targetUserId, targetId = null, targetType = null }) => {
  try {
    // Get the points for this action
    const actionPoints = await VersoRewardsPoints.findOne({ action });

    if (!actionPoints) {
      console.warn(`No points configured for action: ${action}`);
      return null;
    }

    // Create the reward log entry
    const rewardLog = await VersoRewardsLog.create({
      userId,
      action,
      points: actionPoints.points,
      targetUserId,
      targetId,
      targetType,
    });

    console.log(`Reward logged: ${action} - ${actionPoints.points} points for user ${targetUserId}`);
    return rewardLog;
  } catch (error) {
    console.error(`Error logging reward action ${action}:`, error.message);
    // Don't throw - reward logging should not break the main flow
    return null;
  }
};

module.exports = { logRewardAction };
