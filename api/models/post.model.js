const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    mainImageURL: {
      type: String,
    },
    section: {
      type: String,
    },
    subSection: {
      type: String,
    },
    header: {
      type: String,
    },
    standFirst: {
      type: String,
    },
    credits: {
      type: String,
    },
    bodyRichText: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
