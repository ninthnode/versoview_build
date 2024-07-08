const mongoose = require("mongoose");

const dmMessagesSchema = new mongoose.Schema(
  {
    senderUserId: {
      type: String,
      required: true,
    },
    receiverUserId: {
      type: String,
      required: true,
    },
    messageText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DmMessage = mongoose.model("DmMessage", dmMessagesSchema);

module.exports = { DmMessage };
