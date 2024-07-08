const mongoose = require("mongoose");

const replyCommentSchema = new mongoose.Schema(
  {
    postCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostComment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentReply: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostCommentReply = mongoose.model("PostCommentReplies", replyCommentSchema);

module.exports = { PostCommentReply };
