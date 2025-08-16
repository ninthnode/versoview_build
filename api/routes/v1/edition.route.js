const express = require("express");
const {
	createEdition,
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
const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

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
 
module.exports = router;
