const mongoose = require("mongoose");

const libraryImageSchema = new mongoose.Schema(
  {
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Edition",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const LibraryImage = mongoose.model("LibraryImage", libraryImageSchema);

module.exports = { LibraryImage }; 