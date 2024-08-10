"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import {
  getCommentByPostId,
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
} from "@/redux/comments/commentAction";
import { connect } from "react-redux";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import CommentsModal from "./CommentsModal";

const Comments = ({
  id,
  isOpenCommentModal,
  onToggleCommentModal,
  commentState,
  loading,
  getCommentByPostId,
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
  addRemoveBookmarks,
  postTitle
}) => {

  const commentId = id;
  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    getCommentByPostId(commentId);
  }, [getCommentByPostId, commentId]);

  useEffect(() => {
    if (commentState&&commentState.length > 0) {
      setCommentList(commentState);
    }
  }, [commentState]);

  const submitBookmark = async (type, commentId) => {
    const response = await addRemoveBookmarks(type, commentId);
    const updatedData = { isBookmarked: response.data.isBookmarked };
    setCommentList((prevItems) =>
      prevItems.map((item) =>
        item._id === response.data.postCommentId
          ? { ...item, ...updatedData }
          : item
      )
    );
  };

  const upvoteComment = async (changeCommentId) => {
    await updateCommentUpvote(changeCommentId);
    getCommentByPostId(commentId);
  };

  const downvoteComment = async (changeCommentId) => {
    await updateCommentDownvote(changeCommentId);
    getCommentByPostId(commentId);
  };

  const submitComment = async () => {
    let commentObj = {
      excerpt: "",
      commentText: commentText,
    };
    await addCommentToPost(commentId, commentObj);
    getCommentByPostId(commentId);
    setCommentText("");
    onToggleCommentModal()
  };

  const handleChangeComment = (e) => {
    setCommentText(e.target.value);
  };

  return (
    <Box p={4}>
      <Box maxW="2xl" my="4" textAlign='right'>
        <Textarea
          type="comment"
          placeholder="Enter Comment..."
          name="commenttext"
          value={commentText}
          onChange={handleChangeComment}
        />
        <Button
          onClick={submitComment}
          size="md"
          colorScheme="green"
        >
          Post {commentText !== '' && loading ? <Spinner size="sm" color="white" /> : ''}
        </Button>
      </Box>
      {commentList && (
        <CommentsModal
        postTitle={postTitle}
          commentList={commentList}
          upvoteComment={upvoteComment}
          downvoteComment={downvoteComment}
          submitBookmark={submitBookmark}
          isOpenCommentModal={isOpenCommentModal}
          onToggleCommentModal={onToggleCommentModal}
        />
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  commentState: state.comment.comments,
  loading: state.comment.loading,
});

const mapDispatchToProps = {
  getCommentByPostId,
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
  addRemoveBookmarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
