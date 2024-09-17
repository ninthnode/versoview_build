const mongoose = require("mongoose");

const editionSchema = new mongoose.Schema(
  {
    postId: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			require: true,
		},
	],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    pdfUrl: {
			type: String,
		},
    editionText: {
			type: String,
		},
    editionDescription: {
			type: String,
		},
    editionDate: {
			type: String,
		},
  },
  {
    timestamps: true,
  }
);

const Edition = mongoose.model("Edition", editionSchema);

module.exports = { Edition };