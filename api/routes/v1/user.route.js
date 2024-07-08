const express = require("express");
const { upload } = require("../../config/multerUpload");

var multer = require("multer");
var multerGoogleStorage = require("multer-cloud-storage");

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updateUser,
  getUser
} = require("../../controllers/user.controller");

const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

//base route /api/v1/users/

// Login and sign up manually
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);
router.put("/updateUser/:_id", protectUser, updateUser);
router.get("/getUser/:_id", protectUser, getUser);

module.exports = router;
