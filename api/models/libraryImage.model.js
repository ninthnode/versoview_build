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
    mergedImages: {
      type: [String],
    },
    allImages: [
      {
        url: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LibraryImage = mongoose.model("LibraryImage", libraryImageSchema);

module.exports = { LibraryImage }; 