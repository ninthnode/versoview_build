const asyncHandler = require("express-async-handler");
const { Genre } = require("../models/genre.model");

// Create Channel
module.exports.createGenre = asyncHandler(async (req, res) => {
	try {
		const genre = {
			genreName: req.body.genreName,
			status: req.body.status,
		};
		const newGenre = new Genre(genre);
		await newGenre.save();

		res.status(201);
		res.json({ message: "Genre Created", data: newGenre });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all genre
module.exports.getAllGenre = asyncHandler(async (req, res) => {
	try {
		const genreData = await Genre.find();

		if (genreData) {
			return res.status(200).json({ status: 200, data: genreData });
		} else {
			return res.status(200).json({ status: 404, message: "No genres found" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});
