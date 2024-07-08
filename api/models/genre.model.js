const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema(
  {
    genreName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Genre = mongoose.model("Genre", genreSchema);

module.exports = { Genre };
