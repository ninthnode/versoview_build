const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  create,
  extractPDFSlides,
  getAllPdfSlides,
  getAllPost,
  getPostById,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost,
  bookmarkPost,
  getAllBookmark,
  removeBookmarkPost,
  addToFavorite,
  removeToFavorite,
  voting,
  getPostByChannelId,
  postComment,
  postCommentReply,
  getAllComment,
  getAllCommentReplies,
  upvoteComment,
  downvoteComment,
  commentVoting,
  commentReply,
  getCommentReplies,
  unreadPost,
  getAllUnreadPost,
  deleteUnreadPost,
  deletePostComment,
  deleteCommentReply,
  postOwner
} = require("../../controllers/post.controller");
const { protectUser } = require("../../middlewares/authMiddleware");
const { upload } = require("../../config/multerUpload");

const router = express.Router();

router.post("/createPost", protectUser, create);
router.get("/getAllPost", getAllPost);
router.get("/getPost/:_id", getPostById);
router.get("/getPostByChannelId/:_id", getPostByChannelId);
router.put("/updatePost/:_id", protectUser, updatePost);
router.delete("/deletePost/:_id", protectUser, deletePost);
router.post("/upVote/:_id", protectUser, upvotePost);
router.put("/downVote/:_id", protectUser, downvotePost);
router.post("/upvoteComment/:_id", protectUser, upvoteComment);
router.put("/downvoteComment/:_id", protectUser, downvoteComment);
router.get("/voting/:postId", protectUser, voting);
router.get("/commentVoting/:postCommentId", protectUser, commentVoting);
router.post("/addBookmark/:_id", protectUser, bookmarkPost);
router.delete("/removeBookmark/:_id", protectUser, removeBookmarkPost);
router.get("/getBookmark", protectUser, getAllBookmark);
router.post("/addFavorite/:_id", protectUser, addToFavorite);
router.delete("/removeFavorite/:_id", protectUser, removeToFavorite);
router.post("/extractPdf", protectUser, upload.single("pdf"), extractPDFSlides);
router.get("/getPdfSlides", protectUser, getAllPdfSlides);
router.post("/postComment/:_id", protectUser, postComment);
router.get("/getAllComment/:_id", protectUser, getAllComment);
router.get("/getAllCommentReplies/:_id", protectUser, getAllCommentReplies);
router.post("/postCommentReply/:_id", protectUser, postCommentReply);
router.post("/commentReply/:_id", protectUser, commentReply);
router.get("/getCommentReplies/:_id", protectUser, getCommentReplies);
router.post("/unreadPost", protectUser, unreadPost);
router.get("/getAllUnreadPost/:_id", protectUser, getAllUnreadPost);
router.delete("/deleteUnreadPost/:_id", protectUser, deleteUnreadPost);
router.delete("/deletePostComment/:_id", protectUser, deletePostComment);
router.delete("/deleteCommentReply/:_id", protectUser, deleteCommentReply);
router.get("/postOwner/:_id", protectUser, postOwner);

module.exports = router;
