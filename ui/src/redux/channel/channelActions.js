import axios from "axios";
import token from "@/app/utils/token";
import {
  FETCH_CHANNEL_REQUEST,
  FETCH_CHANNEL_SUCCESS,
  FETCH_CHANNEL_FAILURE,
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
  FETCH_POSTS_FAILURE,
  FETCH_FOLLOWERS_REQUEST,
  FETCH_FOLLOWERS_SUCCESS,
  FETCH_FOLLOWERS_FAILURE,
  FETCH_FOLLOWINGS_SUCCESS,
  FOLLOW_CHANNEL_REQUEST,
  FOLLOW_CHANNEL_SUCCESS,
  FOLLOW_CHANNEL_FAILURE,
  UNFOLLOW_CHANNEL_REQUEST,
  UNFOLLOW_CHANNEL_SUCCESS,
  UNFOLLOW_CHANNEL_FAILURE,
} from "./channelTypes";

export const fetchChannel = (id) => async (dispatch) => {
  dispatch({ type: FETCH_CHANNEL_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getChannel/${id}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch({ type: FETCH_CHANNEL_SUCCESS, payload: response.data.data });
  } catch (error) {
    dispatch({ type: FETCH_CHANNEL_FAILURE, error });
  }
};

export const fetchPosts = (channelId) => async (dispatch) => {
  dispatch({ type: FETCH_POSTS_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostByChannelId/${channelId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch({ type: FETCH_POSTS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_POSTS_FAILURE, error });
  }
};

export const fetchFollowers = (channelId) => async (dispatch) => {
  dispatch({ type: FETCH_FOLLOWERS_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/followersList/${channelId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch({ type: FETCH_FOLLOWERS_SUCCESS, payload: response.data.data });
  } catch (error) {
    dispatch({ type: FETCH_FOLLOWERS_FAILURE, error });
  }
};
export const fetchFollowings = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_FOLLOWERS_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/followingList/${userId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch({ type: FETCH_FOLLOWINGS_SUCCESS, payload: response.data.data });
  } catch (error) {}
};

export const followChannel = (channelId) => async (dispatch) => {
  dispatch({ type: FOLLOW_CHANNEL_REQUEST });
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/followChannel/${channelId}`,
      { status: "active" },
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch(fetchFollowers(channelId));
    dispatch({ type: FOLLOW_CHANNEL_SUCCESS, payload: channelId });
  } catch (error) {
    dispatch({ type: FOLLOW_CHANNEL_FAILURE, error });
  }
};

export const unfollowChannel = (channelId) => async (dispatch) => {
  dispatch({ type: UNFOLLOW_CHANNEL_REQUEST });
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/unfollowChannel/${channelId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch(fetchFollowers(channelId));
    dispatch({ type: UNFOLLOW_CHANNEL_SUCCESS, payload: channelId });
  } catch (error) {
    dispatch({ type: UNFOLLOW_CHANNEL_FAILURE, error });
  }
};

export const getFollowingStatus = (channelId) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getFollowChannel/${channelId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    
    return response.data.data;
  } catch (error) {
  }
};
export const fetchfollowChannelList = () => async (dispatch) => {
  dispatch({ type: FETCH_FOLLOWERS_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/followChannelList`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replace(/"/g, "")}`,
        },
      }
    );
    dispatch({ type: FETCH_FOLLOWINGS_SUCCESS, payload: response.data });
  } catch (error) {}
};