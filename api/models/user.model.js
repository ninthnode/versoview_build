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
		profileBgColor: {
			type: String,
			default: "c8e1e1",
		},
		profileAbout: {
			type: String,
			default: "",
		},
		profileUrl: {
			type: String,
			default: "",
		},
		profilePhone: {
			type: String,
			default: "",
		},

		profileLocation: {
			type: String,
			default: "",
		},
		profileInstagram: {
			type: String,
			default: "",
		},
		profileTelegram: {
			type: String,
			default: "",
		},
		profileFacebook: {
			type: String,
			default: "",
		},
		profileTwitter: {
			type: String,
			default: "",
		},

		genre: {
			type: [String],
			default: ["array"],
		},
		subGenre: {
			type: [String],
			default: ["array"],
		},
		googleId: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
