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

    FETCH_USER_CHANNEL
  } from './channelTypes';
  
  const initialState = {
    userChannel: null,
    channel: null,
    posts: [],
    followers: [],
    followings:[],
    isLoading: false,
    error: null,
    isFollowing: false,
  };
  
  const channelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHANNEL_REQUEST:
      case FETCH_POSTS_REQUEST:
      case FETCH_FOLLOWERS_REQUEST:
      case FOLLOW_CHANNEL_REQUEST:
      case UNFOLLOW_CHANNEL_REQUEST:
        return {
          ...state,
          isLoading: true,
        };
      case FETCH_CHANNEL_SUCCESS:
        return {
          ...state,
          channel: action.payload,
          isLoading: false,
        };
      case FETCH_POSTS_SUCCESS:
        return {
          ...state,
          posts: action.payload,
          isLoading: false,
        };
      case FETCH_FOLLOWERS_SUCCESS:
        return {
          ...state,
          followers: action.payload,
          isLoading: false,
        };
      case FETCH_FOLLOWINGS_SUCCESS:
        return {
          ...state,
          followings: action.payload,
          isLoading: false,
        };
      case FOLLOW_CHANNEL_SUCCESS:
        return {
          ...state,
          isFollowing: true,
          isLoading: false,
        };
      case UNFOLLOW_CHANNEL_SUCCESS:
        return {
          ...state,
          isFollowing: false,
          isLoading: false,
        };
      case FETCH_CHANNEL_FAILURE:
      case FETCH_POSTS_FAILURE:
      case FETCH_FOLLOWERS_FAILURE:
      case FOLLOW_CHANNEL_FAILURE:
      case UNFOLLOW_CHANNEL_FAILURE:
        return {
          ...state,
          error: action.error,
          isLoading: false,
        };
        case FETCH_USER_CHANNEL:
        return {
          ...state,
          userChannel: action.payload,
          isLoading: false,
        };
      default:
        return state;
    }
  };
  
  export default channelReducer;
  