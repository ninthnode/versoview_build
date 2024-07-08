const express = require("express");
const router = express.Router();
const {
  adminLogin,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  listPosts,
  deletePost,
  banUser,
  unbanUser,
  addGenre
} = require("../../controllers/admin.controller");

const { protectAdmin } = require("../../middlewares/authMiddleware");

router.post("/adminLogin", adminLogin);
router.post("/addUser", protectAdmin, createUser);
router.post("/addGenre", addGenre);
router.put("/updateUser/:id", protectAdmin, updateUser);
router.get("/listUsers", protectAdmin, listUsers);
router.get("/listPosts", protectAdmin, listPosts);
router.delete("/deleteUser/:id", protectAdmin, deleteUser);
router.delete("/deletePost/:id", protectAdmin, deletePost);
router.post("/banUser/:_id", protectAdmin, banUser);
router.post("/unbanUser/:_id", protectAdmin, unbanUser);

module.exports = router;
