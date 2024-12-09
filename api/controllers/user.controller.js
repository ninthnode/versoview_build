const multer = require("multer");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model");
const { Follow } = require("../models/follow.model");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../config/nodemailer");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const {
  generateToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const v = require("valibot");

const signUpSchema = v.object({
  channelName: v.pipe(
    v.string(),
    v.maxLength(32, "Must be less that 32 characters.")
  ),
  username: v.pipe(
    v.string(),
    v.maxLength(15, "Must be less that 15 characters."),
    v.regex(/^[a-z0-9]*$/, "Must contain only lowercase letters and no spaces")
  ),
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Must be atleast 8 characters."),
    v.regex(/[A-Z]+/, "Must contain upper case characters"),
    v.regex(/[a-z]+/, "Must contain lowercase letter")
  ),
  genre: v.any(),
});

const path = require("node:path");
// const mongoose = require("mongoose");
const { Verify } = require("node:crypto");
const fs = require("node:fs").promises;
const filesys = require("node:fs");
const MailMessage = require("nodemailer/lib/mailer/mail-message");
// Sign Up
module.exports.signUp = asyncHandler(async (req, res) => {
  // parse using valibot
  const parsed = v.safeParse(signUpSchema, req.body);
  console.log("success;", parsed);
  if (!parsed.success) {
    return res.status(400).json({
      status: 400,
      message: parsed.issues.map((i) => ({
        text: i.message,
        type: i.path[0].key,
      })),
    });
  }
  const { channelName, username, email, password, genre } = parsed.output;

  // Check if user already exists
  const isUserExist = await User.findOne({ email: email });
  const isChannelExist = await Channel.findOne({ username: username });
  if (isUserExist) {
    return res
      .status(403)
      .json({
        status: 403,
        message: { text: "User Email already exists", type: "email" },
      });
  }

  if (isChannelExist) {
    return res
      .status(403)
      .json({
        status: 403,
        message: { text: "Channel @username already exists", type: "username" },
      });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({
    channelName: channelName,
    username: username,
    email: email,
    userType: "user",
    status: "active",
    password: hashedPassword,
    genre: req.body.genre || [],
    subGenre: [],
    profileImageUrl: `${req.protocol}://${req.get(
      "host"
    )}/images/default-icon.svg`,
  });

  // create new channel
  const channelData = {
    userId: user._id,
    channelName: req.body.channelName || "",
    username: username,
    about: req.body.about || "",
    genre: req.body.genre || "",
    subGenre: req.body.subGenre || "",
    profileHandle: req.body.profileHandle || "",
    profileTitle: req.body.profileTitle || "",
    url: req.body.url || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    location: req.body.location || "",
    backgroundColor: req.body.backgroundColor || "",
    channelIconImageUrl:
      req.body.location ||
      `${req.protocol}://${req.get("host")}/images/default-icon.svg`,
    status: req.body.status,
  };

  const channel = await Channel.create(channelData);

  // Generate token
  const token = await generateToken(user._id, user.username);
  const refreshtoken = await generateRefreshToken(user._id, user.username);
  res.status(201).json({
    status: 200,
    data: { user, token, refreshtoken },
    message: "User signed up successfully",
  });
});

// User Login
module.exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email, status: "active" });

  if (!user) {
    res.status(403);
    res.json({ message: { text: "Incorrect email", type: "email" } });
  } else {
    const isValidLogin = await bcrypt.compare(password, user.password);

    if (!isValidLogin) {
      res.status(403);
      res.json({ message: { text: "Incorrect password", type: "password" } });
    } else if (isValidLogin) {
      if (user.userType === "publisher") {
        const data = {
          user,
          token: await generateToken(user._id, user.username),
          refreshtoken: await generateRefreshToken(user._id, user.username),
        };
        res.status(200);
        res.json({
          data: data,
          message: "User Login successfully",
        });
      } else if (user.userType === "user") {
        const data = {
          user,
          token: await generateToken(user._id, user.username),
          refreshtoken: await generateRefreshToken(user._id, user.username),
        };
        res.status(200);
        res.json({
          data: data,
          message: "User Login successfully",
        });
      } else {
        res.status(403);
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

    const cert = filesys.readFileSync(path.join(__dirname, "../jwtRS256.pem"));
    const token = jwt.sign({ email: user.email, id: user._id }, cert, {
      expiresIn: "10m",
      algorithm: "RS256",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;

    await sendMail(email, "Reset Password", resetLink);

    res.status(200).json({ message: "Password sucessfully Reset" });
  } catch (error) {
    console.error("Error reset password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Token refresh endpoint
module.exports.refreshTokenApi = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  const cert = filesys.readFileSync(path.join(__dirname, "../jwtRS256.pem"));
  jwt.verify(
    refreshToken,
    cert,
    { algorithms: ["RS256"] },
    async (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = await generateToken(user.id, user.username);
      // console.log(accessToken)
      res.json({ accessToken });
    }
  );
});

// Reset Password
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // console.log(id, token, "id and token is there");
  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.send({ message: "User not exist !!" });
  }
  const cert = filesys.readFileSync(path.join(__dirname, "../jwtRS256.pem"));
  const verify = jwt.verify(token, cert, { algorithms: ["RS256"] });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    if (user && verify) {
      await User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      res.status(200).json({ message: "password updated" });
    }
  } catch (error) {
    res.send("Not verified");
  }
});

// Udate User
module.exports.updateUser = asyncHandler(async (req, res) => {
  const updateData = req.body;
  const userId = req.params._id;
  // try{}
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  });
  const updatedChannelImage = await Channel.findOneAndUpdate(
    { userId: userId },
    { channelIconImageUrl: updateData.profileImageUrl },
    {
      new: true,
    }
  );

  if (!updatedChannelImage) {
    return res.status(404).json({ status: 404, message: "channel not found" });
  }
  if (!updatedUser) {
    return res.status(404).json({ status: 404, message: "User not found" });
  }

  return res.status(200).json({
    status: 200,
    message: "User updated successfully",
    user: updatedUser,
  });
});

// Get user
module.exports.getUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params;
    const userData = await User.findOne({ _id });
    if (!userData) {
      return res
        .status(404)
        .json({ status: 404, message: `User wih Id ${_id} Not Found !` });
    }
    //get user posts titles
    const posts = await Post.find({ userId: _id });
    const totalPosts = await Post.find({ userId: _id }).countDocuments();
    const channelData = await Channel.findOne({ userId: _id });
    //get user channel followings
    const channelFollowings = await Follow.find({
      userId: _id,
    }).countDocuments();
    //get user channel followers
    const channelFollowers = await Follow.find({
      channelId: channelData._id,
    }).countDocuments();
    const userObj = userData.toObject();

    userObj.posts = posts;
    userObj.channelId = channelData._id;
    userObj.totalPosts = totalPosts;
    userObj.channelFollowings = channelFollowings;
    userObj.channelFollowers = channelFollowers;

    return res.status(200).json({ status: 200, user: userObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});
// Verify if user token is Valid
module.exports.verifyUser = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization;
    const filePath = path.resolve(__dirname, "../jwtRS256.pem");

    // Read the file
    const cert = await fs.readFile(filePath);
    let userDecoded;
    jwt.verify(token, cert, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      userDecoded = decoded;
    });
    const user = await User.findById(userDecoded.id);

    if (!user) {
      return res.status(401).json({
        status: "ERROR",
        message: "User not registered or token malfunctioned",
        isAuthenticated: false,
      });
    }

    if (user._id.toString() !== userDecoded.id) {
      return res.status(401).json({
        status: "ERROR",
        message: "Access UnAuthorized",
        isAuthenticated: false,
      });
    }

    return res.status(200).json({
      status: "OK",
      isAuthenticated: true,
      user: { id: user._id, name: user.username, email: user.email,googleId:user.googleId },
      // user: { id: user._id, name: "", email: user.email,googleId:'123' },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
      isAuthenticated: false,
    });
  }
});
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports.getChatUsers = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.params.query;
    const searchedUsers = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { username: { $regex: new RegExp(query, "i") } },
          ],
        },
      ],
    });
    

    res.status(200).json(searchedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.googleAuth = asyncHandler(async (req, res) => {
  const { googleToken } = req.body;
  let ticket;
  try {
    ticket = await axios
    .get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` },
    })
    .then(res => res.data);
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: { text: "Invalid Google token", type: "googleToken" },
    });
  }

  const { sub: googleId, email, name, picture } = ticket;
  // Check if user already exists
  let user = await User.findOne({ googleId });
  if (user) {
    
  const token = await generateToken(user._id, user.username);
  const refreshtoken = await generateRefreshToken(user._id, user.username);
    return res.status(200).json({
      status: 200,
      data: { user, token, refreshToken: refreshtoken },
      message: "User Logged in successfully",
    });
  }

  // Check if email is already associated with another account
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return res.status(403).json({
      status: 403,
      message: { text: "Email already associated with another account", type: "email" },
    });
  }
 // Check if the username is taken, and create a unique username
 let username = name.split(" ").join("").toLowerCase().substring(0, 15);
 let existingUser = await User.findOne({ username });
 let uniqueUsername = username;
 let counter = 1;

 while (existingUser) {
   uniqueUsername = `${username}${counter}`;
   existingUser = await User.findOne({ username: uniqueUsername });
   counter++;
 }
  // Create a new user
  user = await User.create({
    googleId,
    email,
    channelName: name || "",
    username: uniqueUsername,
    userType: "user",
    status: "active",
    genre: [],
    subGenre: [],
    profileImageUrl: picture || `${req.protocol}://${req.get("host")}/images/default-icon.svg`,
   });

  const channelData = {
    userId: user._id,
    channelName: name || "",
    username: user.username,
    about: "",
    genre: "",
    subGenre: "",
    profileHandle: "",
    profileTitle: "",
    url: "",
    email: email,
    phone: "",
    location: "",
    backgroundColor: "",
    channelIconImageUrl: picture || `${req.protocol}://${req.get("host")}/images/default-icon.svg`,
    status: "active",
  };

  const channel = await Channel.create(channelData);

  // Generate tokens
  
  const token = await generateToken(user._id, user.username);
  const refreshtoken = await generateRefreshToken(user._id, user.username);
  res.status(201).json({
    status: 201,
    data: { user, token, refreshtoken },
    message: "User signed up successfully with Google",
  });
});
