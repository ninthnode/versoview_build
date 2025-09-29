const express = require("express");
const {
	createEdition,
	createEditionSSE,
	getAllEdition,
	getEditionById,
	getEditionsByUserId,
	deleteEdition,
	getPdf,
	uploadLibraryImage,
	getEditionsSize,
	getLibraryImagesByEditionId,
	getLibraryImagesForPageTurner,
	uploadPostImage
} = require("../../controllers/edition.controller");
const { sseProgress } = require("../../controllers/sse.controller");
const { protectUser } = require("../../middlewares/authMiddleware");
const multer = require('multer');

// Configure multer for PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const router = express.Router();

// New SSE-based create-edition endpoint
router.post("/create-edition-sse", protectUser, upload.single('pdf'), createEditionSSE);

// Original create-edition endpoint (for backward compatibility)
router.post("/create-edition", protectUser, createEdition);
router.get("/getAll", protectUser, getAllEdition);
router.get("/getEditionById/:_id", protectUser, getEditionById);
router.get("/getPdf/:_id", getPdf);
router.get("/getEditionsByUserId/:_id", getEditionsByUserId);
router.delete("/deleteEdition/:_id", deleteEdition);
router.post("/uploadLibraryImage/:_id",protectUser, uploadLibraryImage);
router.get("/getEditionsSize",protectUser, getEditionsSize);
router.get("/getLibraryImages", protectUser, getLibraryImagesByEditionId);
router.get("/getLibraryImagesForPageTurner/:_id", getLibraryImagesForPageTurner);
router.post("/uploadPostImage", protectUser, uploadPostImage);

// SSE Progress endpoint - no auth required, session-based security
router.get("/progress/:sessionId", sseProgress);
 
module.exports = router;
