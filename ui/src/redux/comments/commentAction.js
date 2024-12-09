import axios from "axios";
import {
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  GET_COMMENT_REPLIES_SUCCESS,
  GET_COMMENT_AND_REPLIES_COUNT,
  OPEN_COMMENTS_MODAL,
  CLOSE_COMMENTS_MODAL,
  NEXT_PAGE,
  PREVIOUS_PAGE,
} from "./commentType";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Code } from "@chakra-ui/react";
import { compose } from "redux";
import { set } from "valibot";

// export const openCommentModal = (comment) => ({
//   type: OPEN_COMMENTS_MODAL,
//   payload: comment,
// });
export const closeCommentModal = () => ({
  type: CLOSE_COMMENTS_MODAL,
});

const getCommentsRequest = () => ({
  type: GET_COMMENTS_REQUEST,
});

const getCommentsSuccess = (comments) => ({
  type: GET_COMMENTS_SUCCESS,
  payload: comments,
});

const getCommentsFailure = (error) => ({
  type: GET_COMMENTS_FAILURE,
  payload: error,
});

export const openCommentModal = (postId,type) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      if(type === 'comment'){
      
        dispatch({
            type: OPEN_COMMENTS_MODAL,
            payload: [postId],
          });
      }else if(type === 'post'){
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllComment/${postId}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.data.data;
        dispatch({
          type: OPEN_COMMENTS_MODAL,
          payload: data,
        });
      }
      
    } catch (error) {
      dispatch(getCommentsFailure(error));
    }
  };
};
export const getCommentByPostId = (postId) => {
  return async (dispatch) => {
    dispatch(getCommentsRequest());
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllComment/${postId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data.data;
      dispatch(getCommentsSuccess(data));
      dispatch(getCommentAndRepliesCount(postId));
    } catch (error) {
      dispatch(getCommentsFailure(error));
    }
  };
};
export const addCommentToPost = (postId, commentObj) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/postComment/${postId}`,
        commentObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(getCommentAndRepliesCount(postId));
      toast(response.data.statusText, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {
      toast("Error Adding Comment", {
        autoClose: 3000,
        type: "error",
      });
      dispatch(getCommentsFailure(error));
    }
  };
};
const addRepliesToNestedComments = (comments, commentId, newReplies) => {
  return comments.map((comment) => {
    // If this comment matches the commentId, add the new replies
    if (comment._id === commentId) {
      const existingReplies = comment.replies || [];

      const filteredNewReplies = newReplies.filter(
        (newReply) =>
          !existingReplies.some(
            (existingReply) => existingReply._id === newReply._id
          )
      );

      return {
        ...comment,
        opened: true,
        replies: [...existingReplies, ...filteredNewReplies]
          .filter((item) => typeof item === "object" && item !== null)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      };
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addRepliesToNestedComments(
          comment.replies,
          commentId,
          newReplies
        ),
      };
    }

    return comment;
  });
};

export const getCommentRepliesByCommentId = (
  commentId,
  postId,
  level,
  lastComments
) => {
  return async (dispatch, getState) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const { comment } = getState();

      if (level > 1) {
        const tempPagesData = {
          ...comment.pagesData,
          [comment.pageNumber]: comment.comments,
        };
        dispatch({
          type: NEXT_PAGE,
          payload: { arr: tempPagesData, page: comment.pageNumber + 1 },
        });
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllCommentReplies/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentAndRepliesCount(postId));
      let getCommentReplies = await addRepliesToNestedComments(
        comment.comments,
        commentId,
        response.data.replies
      );

      let newArr = [];
      if (level > 1) {
      lastComments.forEach((element) => {
        if (element._id===commentId)
          newArr.push({
            ...element,
            opened: true,
            replies: response.data.replies,
          });
        else newArr.push(element);
      });
      }
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: newArr.length > 0 ? newArr : getCommentReplies,
      });
    } catch (error) {}
  };
};
export const getPreviousPage = (sectionRefs,id) => {
  return async (dispatch, getState) => {
    try {
      const { comment } = getState();
      const { [comment.pageNumber]: _, ...tempPagesData } = comment.pagesData;
      dispatch({
        type: PREVIOUS_PAGE,
        payload: tempPagesData,
      });
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: comment.pagesData[comment.pageNumber - 1],
      });
      setTimeout(() => {
        sectionRefs.current[id].scrollIntoView({ behavior: "auto",block: "center",inline: "nearest" });
        sectionRefs.current[id].style.transition = "background-color 0.5s ease-in-out";
        sectionRefs.current[id].style.backgroundColor = "#efefef";
  
        // Remove highlight after 1 second
        setTimeout(() => {
          sectionRefs.current[id].style.backgroundColor = "transparent";
        }, 800);
      },10);


    } catch (error) {}
  };
};
export const getCommentAndRepliesCount = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getCommentAndRepliesCount/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      dispatch({
        type: GET_COMMENT_AND_REPLIES_COUNT,
        payload: data,
      });
    } catch (error) {}
  };
};

const updateCommentVote = async (comments, commentId, voteType, response) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment._id === commentId) {
      if (response.status === 200) {
        if (response.data.voteType) {
          comment.trueCount = comment.trueCount + 1;
          if (comment.falseCount > 0)
            comment.falseCount = comment.falseCount - 1;
        } else {
          if (comment.trueCount > 0) comment.trueCount = comment.trueCount - 1;
          comment.falseCount = comment.falseCount + 1;
        }
      } else if (response.status === 400) {
        if (response.data.voteType == true) {
          comment.trueCount = comment.trueCount - 1;
        }
        if (response.data.voteType == false) {
          comment.falseCount = comment.falseCount - 1;
        }
      }
      return comments;
    }

    // If it has replies, continue searching in the nested replies
    if (Array.isArray(comment.replies) && comment.replies.length > 0) {
      const updatedReplies = await updateCommentVote(
        comment.replies,
        commentId,
        voteType,
        response
      );
      if (updatedReplies) return comments;
    }
  }
  return null;
};
export const updateCommentUpvote = (commentId) => {
  return async (dispatch, getState) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/upvoteComment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { comment } = getState();
      const updatedComments = await updateCommentVote(
        comment.comments,
        commentId,
        true,
        response.data
      );
      if (comment.pageNumber > 0) {
        const updatedComments2 = await updateCommentVote(
          comment.pagesData[comment.pageNumber - 1],
          commentId,
          true,
          response.data
        );
      }
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: updatedComments,
      });
      toast("Comment " + response.data.message, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {}
  };
};
export const updateCommentDownvote = (commentId) => {
  return async (dispatch, getState) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/downvoteComment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { comment } = getState();
      const updatedComments = await updateCommentVote(
        comment.comments,
        commentId,
        false,
        response.data
      );
      if (comment.pageNumber > 0) {
        const updatedComments2 = await updateCommentVote(
          comment.pagesData[comment.pageNumber - 1],
          commentId,
          false,
          response.data
        );
      }
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: updatedComments,
      });
      toast("Comment " + response.data.message, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {}
  };
};

export const updateCommentReplyUpvote = (commentId, replyId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/upvoteComment/${replyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentRepliesByCommentId(commentId));
      toast("Comment Reply " + response.data.message, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {}
  };
};

export const updateCommentReplyDownvote = (commentId, replyId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/downvoteComment/${replyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentRepliesByCommentId(commentId));
      toast("Comment Reply " + response.data.message, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {}
  };
};




const updateCommentCount = async (comments, commentId) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment._id === commentId) {
      comment.replyCount = comment.replyCount + 1;
      return comments;
    }

    // If it has replies, continue searching in the nested replies
    if (Array.isArray(comment.replies) && comment.replies.length > 0) {
      const updatedReplies = await updateCommentCount(
        comment.replies,
        commentId,
      );
      if (updatedReplies) return comments;
    }
  }
  return null;
};
export const replyToPostComment = (
  commentId,
  commentReply,
  postId,
  level,
  lastComments
) => {
  return async (dispatch, getState) => {
    try {
      const { comment } = getState();

      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/postComment/${postId}`,
        { commentReply: commentReply, parentId: commentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let getCommentReplies = await addRepliesToNestedComments(
        comment.comments,
        commentId,
        response.data.data
      );
      let newArr = [];
      
      const updatedAllCommentCount = await updateCommentCount(getCommentReplies, commentId);
      const updatedCurrentCommentCount = await updateCommentCount(comment.comments, commentId);

      if (level > 1) {
        const tempPagesData = {
          ...comment.pagesData,
          [comment.pageNumber]: updatedCurrentCommentCount,
        };
        dispatch({
          type: NEXT_PAGE,
          payload: { arr: tempPagesData, page: comment.pageNumber + 1 },
        });
      }
      if (level > 1) {
        lastComments.forEach((element) => {
          if (element._id===commentId)
            newArr.push({
              ...element,
              opened: true,
              replies: response.data.data,
            });
          else newArr.push(element);
        });
        }
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: newArr.length > 0 ? newArr : updatedAllCommentCount,
      });
      toast(response.data.statusText, {
        autoClose: 3000,
        type: "success",
      });
    } catch (error) {
      console.log(error);
      // toast("Error Adding Comment Reply", {
      //   autoClose: 3000,
      //   type: "error",
      // });
    }
  };
};
