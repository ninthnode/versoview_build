const mongoose = require("mongoose");

const commentReplySchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
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

const CommentReply = mongoose.model("CommentReplies", commentReplySchema);

module.exports = { CommentReply };
