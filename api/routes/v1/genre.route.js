const express = require("express");
const {
	createGenre,
	getAllGenre,
} = require("../../controllers/genre.controller");
const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/creatGenre", protectUser, createGenre);
router.get("/getAllGenre", protectUser, getAllGenre);

module.exports = router;
