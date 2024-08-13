"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Textarea,
  Spinner,
  Flex
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
  postTitle,
  commentText,
  handleChangeComment,
  submitComment,isAuthenticated
}) => {

  const commentId = id;
  const [commentList, setCommentList] = useState([]);
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

  const submitCommentByText = async () => {
    await submitComment();
    onToggleCommentModal()
    getCommentByPostId(commentId);
  };

  return (
    <Box py={4}>
      <Flex maxW="2xl" my="4" textAlign='right' gap='4'>
        <Textarea
          type="comment"
          placeholder="Enter Comment..."
          name="commenttext"
          value={commentText}
          onChange={(e) => handleChangeComment(e.target.value)}
          border='1px solid #000'
          rows='5'
        />
        <Button
          onClick={submitCommentByText}
          size="md"
          colorScheme="green"
          isDisabled={!isAuthenticated}
        >
          Post {commentText !== '' && loading ? <Spinner size="sm" color="white" /> : ''}
        </Button>
      </Flex>
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
