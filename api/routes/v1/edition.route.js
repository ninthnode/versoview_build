const express = require("express");
const {
	createEdition,
	getAllEdition,
	getEditionById,
	getEditionsByUserId,
	deleteEdition
} = require("../../controllers/edition.controller");
const { protectUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-edition", protectUser, createEdition);
router.get("/getAll", protectUser, getAllEdition);
router.get("/getEditionById/:_id", protectUser, getEditionById);
router.get("/getEditionsByUserId/:_id", getEditionsByUserId);
router.delete("/deleteEdition/:_id", deleteEdition);
 
module.exports = router;
