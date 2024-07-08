const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Topic = mongoose.model("Topic", topicSchema);

module.exports = { Topic };
