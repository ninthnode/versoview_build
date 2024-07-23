import { GET_POSTS_REQUEST, GET_POSTS_SUCCESS, GET_POSTS_FAILURE,
  GET_SINGLE_POST_SUCCESS,
  GET_RECENT_POSTS_SUCCESS,
  GET_SINGLE_POST_VOTES_SUCCESS } from './postType';
import axios from 'axios';

export const getPostsRequest = () => ({
  type: GET_POSTS_REQUEST,
});

export const getPostsSuccess = (posts) => ({
  type: GET_POSTS_SUCCESS,
  payload: posts,
});

export const getPostsFailure = (error) => ({
  type: GET_POSTS_FAILURE,
  payload: error,
});

export const fetchPosts = () => {
  return async (dispatch,getState) => {
    const { auth } = getState();
    dispatch(getPostsRequest());
    try {
      let response={}
      if (auth.isAuthenticated){
        const token = localStorage.getItem("token").replaceAll('"', "");

        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllPost`,{ 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      else{
        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostIfUserNotLoggedIn`);
      }
      const data = await response.data.data
      dispatch(getPostsSuccess(data));
    } catch (error) {
      dispatch(getPostsFailure(error.message));
    }
  };
};
export const fetchRecentlyViewedPosts = () => {
  return async (dispatch,getState) => {
    dispatch(getPostsRequest());
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getRecentlyViewedPosts`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      const data = await response.data.data
      dispatch({
        type: GET_RECENT_POSTS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch(getPostsFailure(error.message));
    }
  };
};
export const getPostById = (postId) => {
  return async (dispatch) => {
    dispatch(getPostsRequest());
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPost/${postId}`, { 
        headers: {
        Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.data.data
      dispatch({
        type: GET_SINGLE_POST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};

export const updatePostUpvote = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/upVote/${postId}`,
        {},
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getPostsRequest());
    } catch (error) {
    }
  };
};
export const updatePostDownvote = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/downVote/${postId}`,
        {},
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getPostsRequest());
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};