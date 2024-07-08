const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const { generateToken } = require("../utils/generateToken");
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
const { Channel } = require("../models/channel.model");
const { UserBan } = require("../models/userBan.model");
const { Genre } = require("../models/genre.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const axios = require("axios");

// Controller function to list all users
module.exports.listUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Admin login
module.exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email, userType: "admin" });

  if (!user) {
    res.status(401);
    res.json({ error: "Incorrect email or password" });
  } else {
    var isValidLogin = await bcrypt.compare(password, user.password);

    if (isValidLogin) {
      let data = {
        user,
        token: await generateToken(user._id),
      };

      res.status(200);
      res.json({ data });
    } else {
      res.status(401);
      res.json({ error: "Incorrect email or password" });
    }
  }
});

// Add user
module.exports.createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  var hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    userType: "user",
    status: "active",
    password: hashedPassword,
  });

  let data = {
    user,
    token: await generateToken(user._id),
  };

  res.status(200);
  res.json({ data });
});

// Update user
module.exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, password } = req.body;

    // Check if the user exists
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    userToUpdate.firstName = firstName || userToUpdate.firstName;
    userToUpdate.lastName = lastName || userToUpdate.lastName;
    userToUpdate.email = email || userToUpdate.email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User updated successfully", data: userToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users
module.exports.listUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user
module.exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    // Perform the deletion
    await userToDelete.remove();

    res
      .status(200)
      .json({ message: "User deleted successfully", data: userToDelete });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get post
module.exports.listPosts = asyncHandler(async (req, res) => {
  try {
    const postData = await Post.find();

    res.status(200);
    res.json({ message: "Success", data: postData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete post
module.exports.deletePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if the post exists
    const postToDelete = await Post.findById(postId);

    if (!postToDelete) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Perform the deletion
    await postToDelete.remove();

    res
      .status(200)
      .json({ message: "Post deleted successfully", data: postToDelete });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ban user
module.exports.banUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id;
    const channelData = await Channel.findOne({ userId });
    const channelId = channelData._id;

    const userBans = new UserBan({
      userId: userId,
      channelId: channelId,
    });

    await userBans.save();

    // Check if the user exists
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    userToUpdate.status = "banned" || userToUpdate.status;

    // Save the updated user
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User banned successfully", data: userToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Unban user
module.exports.unbanUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id;
    const channelData = await Channel.findOne({ userId });
    const channelId = channelData._id;

    const userBans = new UserBan({
      userId: userId,
      channelId: channelId,
    });

    await userBans.save();

    // Check if the user exists
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    userToUpdate.status = "active" || userToUpdate.status;

    // Save the updated user
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User active successfully", data: userToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add genre
module.exports.addGenre = asyncHandler(async (req, res) => {
  try{
    const { genreName } = req.body;
    const isGenreExist = await Genre.findOne({genreName});
    if(isGenreExist) {
      return res.status(200).json({status: 409, message: "GenreName already exist"});
    }

    const newGenre = new Genre({
      genreName : genreName,
    });

    await newGenre.save();

    return res.status(201).json({status: 201, message: "Genre created successfully"})

  } catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})  