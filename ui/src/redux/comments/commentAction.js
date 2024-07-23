import axios from "axios";
import {
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  GET_COMMENT_REPLIES_SUCCESS,
} from "./commentType";

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
    } catch (error) {
      dispatch(getCommentsFailure(error));
    }
  };
};
export const getCommentRepliesByCommentId = (commentId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllCommentReplies/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      dispatch({
        type: GET_COMMENT_REPLIES_SUCCESS,
        payload: data,
      });
    } catch (error) {}
  };
};

export const updateCommentUpvote = (commentId) => {
  return async (dispatch) => {
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
    } catch (error) {}
  };
};
export const updateCommentDownvote = (commentId) => {
  return async (dispatch) => {
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
    } catch (error) {}
  };
};

export const updateCommentReplayUpvote = (commentId, replayId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/upvoteComment/${replayId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentRepliesByCommentId(commentId));
    } catch (error) {}
  };
};

export const updateCommentReplayDownvote = (commentId, replayId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/downvoteComment/${replayId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentRepliesByCommentId(commentId));
    } catch (error) {}
  };
};
export const replayToPostComment = (commentId, commentReply) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/postCommentReply/${commentId}`,
        { commentReply: commentReply },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getCommentRepliesByCommentId(commentId));
    } catch (error) {}
  };
};
