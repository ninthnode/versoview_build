const multer = require("multer");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/user.model");
const { Channel } = require("../models/channel.model");
const { Post } = require("../models/post.model")
const bcrypt = require("bcryptjs");
const { sendMail } = require("../config/nodemailer");

const { generateToken } = require("../utils/generateToken");

const v = require("valibot");

const signUpSchema = v.object({
	channelName: v.string(),
	username: v.string(),
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(
		v.string(),
		v.regex(/[A-Z]+/, "must contain upper case characters"),
		v.regex(/[a-z]+/, "must contain lowercase letter"),
		v.regex(/[\$|\.|#|%|&|@|-]+/, "Must contain a symbol")
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
	console.log("success;", parsed.success);
	if (!parsed.success) {
		return res
			.status(400)
			.json({
				status: 400,
				message: parsed.issues.map((i) => i.message).join(", "),
			});
	}
	const { channelName, username, email, password, genre } = parsed.output;

	// Check if user already exists
	const isUserExist = await User.findOne({ email: email });
	const isChannelExist = await Channel.findOne({ channelName: channelName });
	if (isUserExist) {
		return res
			.status(403)
			.json({ status: 403, message: "User Email already exists" });
	}

	if (isChannelExist) {
		return res
			.status(403)
			.json({ status: 403, message: "Channel @username already exists" });
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
	});

	// create new channel
	const channelData = {
		userId: user._id,
		channelName: req.body.channelName || "",
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
		channelIconImageUrl: req.body.location || "",
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
	const parsed = v.safeParse(loginSchema, req.body);

	if (!parsed.success) {
		return res.status(200).json({ status: 400, message: parsed.issues.map(i=>i.message).join(', ')});
	}

	const { email, password } = req.body;
	// const { email, password } = req.body;

	const user = await User.findOne({ email: email, status: "active" });

	if (!user) {
		res.status(403);
		res.json({ message: "Incorrect email or password" });
	} else {
		const isValidLogin = await bcrypt.compare(password, user.password);

		if (isValidLogin) {
			if (user.userType === "publisher") {
				const data = {
					user,
					token: await generateToken(user._id, user.username),
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
				{ new: true },
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

	if (!updatedUser) {
		return res.status(404).json({ status: 404, message: "User not found" });
	}

	return res
		.status(200)
		.json({
			status: 200,
			message: "User updated successfully",
			user: updatedUser,
		});
});

// Get user
module.exports.getUser = asyncHandler(async (req, res) => {
  try {
    const {_id} = req.params;
    const userData = await User.findOne({_id });
    if (!userData){
      return res.status(404).json({status:404, message: `User wih Id ${_id} Not Found !`})
    }
    // const genre = userData?.genre;
    return res.status(200).json({status : 200, user: userData})
  } catch(error){
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
})
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
			return res
				.status(401)
				.json({
					status: "ERROR",
					message: "User not registered or token malfunctioned",
					isAuthenticated: false,
				});
		}

		if (user._id.toString() !== userDecoded.id) {
			return res
				.status(401)
				.json({
					status: "ERROR",
					message: "Access UnAuthorized",
					isAuthenticated: false,
				});
		}

		return res
			.status(200)
			.json({
				status: "OK",
				isAuthenticated: true,
				user: { id: user._id, name: user.name, email: user.email },
			});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({
				status: "ERROR",
				message: error.message,
				isAuthenticated: false,
			});
	}
});
