const multer = require("multer");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../config/nodemailer");

const { generateToken } = require("../utils/generateToken");

const path = require("path");
const mongoose = require("mongoose");

// Sign Up
module.exports.signUp = asyncHandler(async (req, res) => {
  const { channelName, username, email, password, genre } = req.body;

  // Check if user already exists
  const isUserExist = await User.findOne({ email: email });
  const isChannelExist = await Channel.findOne({ channelName: channelName });
  if (isUserExist) {
    return res
      .status(200)
      .json({ status: 403, message: "User already exists" });
  }

  if (isChannelExist) {
    return res
      .status(200)
      .json({ status: 403, message: "ChannelName already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    channelName: `@${channelName}`,
    username: username,
    email: email,
    userType: "user",
    status: "active",
    password: hashedPassword,
    genre: req.body.genre || [],
  });

  // create new channel
  const channelData = {
    userId: user._id,
    channelName: `@${req.body.channelName}` || '',
    about: req.body.about || '',
    genre: req.body.genre || '',
    subGenre: req.body.subGenre || '',
    profileHandle: req.body.profileHandle || '',
    profileTitle: req.body.profileTitle || '',
    url: req.body.url || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    location: req.body.location || '',
    backgroundColor: req.body.backgroundColor || '',
    channelIconImageUrl: req.body.location || '',
    status: req.body.status,
  };

  const channel = await Channel.create(channelData);

  // Generate token
  const token = await generateToken(user._id, user.username);
  res.status(201).json({
    status: 200,
    data: { user, token },
    message: "User signed up successfully",
  });
});

// User Login
module.exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email, status: "active" });

  if (!user) {
    res.status(200);
    res.json({ message: "Incorrect email or password" });
  } else {
    var isValidLogin = await bcrypt.compare(password, user.password);

    if (isValidLogin) {
      if (user.userType === "publisher") {
        let data = {
          user,
          token: await generateToken(user._id, user.username),
        };
        res.status(200);
        res.json({
          data: data,
          message: "User Login successfully",
        });
      } else if(user.userType === "user"){
        let data = {
          user,
          token: await generateToken(user._id, user.username),
        };
        res.status(200);
        res.json({
          data: data,
          message: "User Login successfully",
        });
      } else {
        res.status(200);
        res.json({ message: "Unauthorized." });
      }
    } else {
      res.status(200);
      res.json({ message: "Incorrect email or password" });
    }
  }
});

// Forgot Password
module.exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET || "default_secret";
    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "10m",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;

    await sendMail(email, "Reset Password", resetLink);

    res
      .status(200)
      .json({ message: "Reset password link has been sent to your email" });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ error: "Failed to send reset password link" });
  }
});

// Reset Password
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  console.log(id, token, "id and token is there");
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.send({ message: "User not exist !!" });
  }

  const secret = "versoview#secret" + user.password;
  try {
    const verify = jwt.verify(token, secret);
    res.send("verify");
  } catch (error) {
    res.send("Not verified");
  }
});

// Udate User
module.exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const updateData = req.body;
    const userId = req.params._id;
   
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(200).json({ status: 404, message: "User not found" });
    }

    return res.status(200).json({ status: 200, message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
})

// Get user
module.exports.getUser = asyncHandler(async (req, res) => {
  try {
    const username = req.params._id;
    const userData = await User.findOne({username : username});
    const genre = userData.genre;
    return res.status(200).json({satus : 200, genre})
  } catch(error){
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
})
