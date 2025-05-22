const mongoose = require("mongoose");
const { boolean } = require("valibot");

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
    isDefault: {
      type: boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LibraryImage = mongoose.model("LibraryImage", libraryImageSchema);

module.exports = { LibraryImage }; 