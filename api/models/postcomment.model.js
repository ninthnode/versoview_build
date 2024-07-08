const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    excerpt: {
      type: String,
    },
    commentText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostComment = mongoose.model("PostComment", commentSchema);

module.exports = { PostComment };
