import {
  FOLLOW_CHANEL,
  FOLLOW_CHANNEL,
  GET_CHANNEL_DATA,
  GET_CHANNEL_POSTS,
  GET_FOLLOWINGS,
  UNFOLLOW_CHANNEL,
} from "./types";
import get from "@/app/utils/get";

export const fetchChannel = (id) => async (dispatch) => {
  const channelData = await get(`channel/getChannel/${id}`, true).then(
    (r) => r.data
  );
  return dispatch({
    type: GET_CHANNEL_DATA,
    payload: channelData,
  });
};

export const fetchChannelPosts = (id) => async (dispatch) => {
  const posts = await get(`channel/getPostByChannelId/${id}`).then(
    (r) => r.data
  );
  return dispatch({
    type: GET_CHANNEL_POSTS,
    payload: posts,
  });
};

export const getFollowings =
  (id, setIsFollowingLoading) => async (dispatch) => {
    const followings = await get(`channel/getFollowChannel/${id}`, true)
      .then((r) => r.data)
      .finally(() => setIsFollowingLoading(false));
    return dispatch({
      type: GET_FOLLOWINGS,
      payload: followings,
    });
  };

export const follow = () => async (dispatch) => {
  return dispatch({
    type: FOLLOW_CHANNEL,
    payload: {},
  });
};

export const unfollow = () => async (dispatch, getState) => {
  return dispatch({
    type: UNFOLLOW_CHANNEL,
    payload: data,
  });
};

export const getChannelFollowers = () => async (dispatch) => {
  const channelFollowers = await get( `channel/followersList/${channelId}`, true).then(r=>r.data)

  return dispatch({
    type: GET_CHANNEL_FOLLOWERS,
    payload: channelFollowers
  })
}

export const getChannelFollowings = () => async (dispatch) => {
  const channelFollowings = await get( `channel/followingsList/${channelId}`, true).then(r=>r.data)

  return dispatch({
    type: GET_CHANNEL_FOLLOWERS,
    payload: channelFollowings
  })
}