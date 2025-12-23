const multer = require("multer");
const path = require("path");

// Common storage configuration
const storageConfig = multer.diskStorage({
	destination: function (req, file, callback) {
		const des = path.join(__dirname, "../public/uploads/resumes");
		// Set the destination folder based on your requirements
		callback(null, des);
	},
	filename: function (req, file, cb) {
		// Use the original filename for the uploaded file
		cb(null, file.originalname);
	},
});

// Multer configuration for all file uploads
module.exports.upload = multer({
	storage: storageConfig,
});
