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
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
  getCommentRepliesByCommentId,
  replyToPostComment,
  getPreviousPage,getCommentByPostId,closeCommentModal,
  deleteComment
} from "@/redux/comments/commentAction";
import { connect, useSelector } from "react-redux";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import CommentsModal from "./CommentsModal";

const Comments = ({
  id,
  isOpenCommentModal,
  onToggleCommentModal,
  isModalCommentsOpen,
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
  submitComment,isAuthenticated,
  getCommentRepliesByCommentId,
  replyToPostComment,
  getPreviousPage,
  pageNumber,
  commentStateUpdateCount,
  modalComment,
  closeCommentModal,
  postSlug,
  deleteComment,
  currentUser
}) => {


  const postId = id;
  const [commentList, setCommentList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  useEffect(() => {
    if(!isModalCommentsOpen){
      getCommentByPostId(postId);
    }
  }, [getCommentByPostId, postId]);

  useEffect(() => {
    if (commentState) {
      setCommentList(commentState);
      setPageLoading(false);
    }
  }, [commentState,commentStateUpdateCount,isModalCommentsOpen]);

  const submitBookmark = async (type, commentId,bool) => {
    const response = await addRemoveBookmarks(type, commentId,bool);
  };

  const upvoteComment = async (changeCommentId) => {
    await updateCommentUpvote(changeCommentId);
  };

  const downvoteComment = async (changeCommentId) => {
    await updateCommentDownvote(changeCommentId);
  };

  const submitCommentByText = async (istoggle=true) => {
    await submitComment();
    if(istoggle)onToggleCommentModal()
  };
  const updateCommentArray =(id,postId,level,lastComment)=>{
    // console.log(level)
    if(level>1){
      setCommentList([])
      setPageLoading(true)
    };
    getCommentRepliesByCommentId(id,postId,level,lastComment);
  }
  const backToAllComments=()=>{
    getCommentByPostId(postId);
    closeCommentModal();
  }

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
          postId={postId}
          commentList={commentList}
          upvoteComment={upvoteComment}
          downvoteComment={downvoteComment}
          submitBookmark={submitBookmark}
          isOpenCommentModal={isOpenCommentModal}
          isModalCommentsOpen={isModalCommentsOpen}
          onToggleCommentModal={onToggleCommentModal}
          handleChangeComment={handleChangeComment}
          submitCommentByText={submitCommentByText}
          isAuthenticated={isAuthenticated}
          commentText={commentText}
          loading={loading}
          updateCommentArray={updateCommentArray}
          replyToPostComment={replyToPostComment}
          getPreviousPage={getPreviousPage}
          pageNumber={pageNumber}
          modalComment={modalComment}
          backToAllComments={backToAllComments}
          pageLoading={pageLoading}
          deleteComment={deleteComment}
          currentUser={currentUser}
        />
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  commentState: state.comment.comments,
  commentStateUpdateCount: state.comment.commentStateUpdateCount,
  modalComment: state.comment.modalComment,
  pageNumber: state.comment.pageNumber,
  loading: state.comment.loading,
  currentUser: state.auth.user?.user || state.auth.user || state.auth.data,
});

const mapDispatchToProps = {
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
  addRemoveBookmarks,
  getCommentRepliesByCommentId,
  getCommentByPostId,
  replyToPostComment,
  getPreviousPage,
  closeCommentModal,
  deleteComment
};

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
