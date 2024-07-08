const mongoose = require("mongoose");

const commentVoteSchema = new mongoose.Schema(
  {
    votingUserId: {
      type: String,
      required: true,
    },
    postCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostComment",
      required: true,
    },
    voteType: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const CommentVote = mongoose.model("CommentVote", commentVoteSchema);

module.exports = { CommentVote };
