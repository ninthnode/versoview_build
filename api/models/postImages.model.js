const mongoose = require("mongoose");

const postImagesSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false, // Made optional since we might have editionId instead
    },
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Edition",
      required: false, // Made optional since we might have postId instead
    },
    images: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostImages = mongoose.model("PostImages", postImagesSchema);

module.exports = { PostImages };