const express = require("express");

const {
	searchArticles,
	searchUsers,
	searchMessages,
} = require("../../controllers/search.controller");

const router = express.Router();

//base route /api/v1/search/

router.get("/articles/:article", searchArticles);
router.get("/users/:user", searchUsers);
router.get("/messages/:message", searchMessages);

module.exports = router;
