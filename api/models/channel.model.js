const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channelName: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    genre: {
      type: String,
    },
    subGenre: {
      type: String,
    },
    profileTitle: {
      type: String,
    },
    profileHandle: {
      type: String,
    },
    url: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    channelIconImageUrl: {
      type: String,
    },
    backgroundColor: {
      type: String,
    },
    status: {
      type: String,
      default: "active"
    },
  },
  {
    timestamps: true,
  }
);

const Channel = mongoose.model("Channel", channelSchema);

module.exports = { Channel };
