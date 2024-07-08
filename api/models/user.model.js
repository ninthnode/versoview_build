const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: "user",
    },
    loginMode: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
    lastOTPSent: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    genre: {
      type: [String],
      default: ["array"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
