const { compareSync } = require("bcryptjs");
const multer = require("multer");
const path = require("path");

// Common storage configuration
// const storageConfig = multer.diskStorage({
// 	destination: function (req, file, callback) {
// 		const des = path.join(__dirname, "../public/uploads/resumes");
// 		// Set the destination folder based on your requirements
// 		callback(null, des);
// 	},
// 	filename: function (req, file, cb) {
// 		// Use the original filename for the uploaded file
// 		cb(null, file.originalname);
// 	},
// });



const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 	  cb(null, UPLOADS_DIR); // Save files in the uploads directory
// 	},
// 	filename: (req, file, cb) => {
// 	  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
// 	  const ext = path.extname(file.originalname);
// 	  cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
// 	},
//   });
//  = multer({
// 	storage,
// 	fileFilter: (req, file, cb) => {
// 	  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
// 	  const ext = path.extname(file.originalname).toLowerCase();
// 	  if (!allowedExtensions.includes(ext)) {
// 		return cb(new Error('Only image files are allowed!'));
// 	  }
// 	  cb(null, true);
// 	},
//   });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

module.exports.upload = multer({ 
    storage, 
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    },
});