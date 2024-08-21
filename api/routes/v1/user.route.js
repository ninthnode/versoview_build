const express = require("express");
const { upload } = require("../../config/multerUpload");

const multer = require("multer");
const multerGoogleStorage = require("multer-cloud-storage");

const {
	signUp,
	login,
	forgotPassword,
	resetPassword,
	updateUser,
	getUser,
	verifyUser,
	refreshTokenApi
} = require("../../controllers/user.controller");

const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

//base route /api/v1/users/

// Login and sign up manually
router.post("/signUp", signUp);
router.post("/login", login);
router.get("/verify-user", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);
router.put("/updateUser/:_id", protectUser, updateUser);
router.get("/getUser/:_id", protectUser, getUser);
router.post("/refresh-token", refreshTokenApi);

module.exports = router;
