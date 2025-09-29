import {
  FETCH_PINNED_CHANNEL_SUCCESS,
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
    FETCH_USER_FOLLOWINGS_SUCCESS,
    FOLLOW_CHANNEL_REQUEST,
    FOLLOW_CHANNEL_SUCCESS,
    FOLLOW_CHANNEL_FAILURE,
    UNFOLLOW_CHANNEL_REQUEST,
    UNFOLLOW_CHANNEL_SUCCESS,
    UNFOLLOW_CHANNEL_FAILURE,

    FETCH_USER_CHANNEL,
    CLEAR_CHANNEL
  } from './channelTypes';
  
  const initialState = {
    userChannel: null,
    channel: null,
    posts: [],
    followers: [],
    followings:[],
    userFollowings:[],
    isChannelLoading: true,
    isPostLoading: true,
    isFollowLoading: false,
    error: null,
    isFollowing: false,
    pinnedChannels:[]
  };
  
  const channelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_PINNED_CHANNEL_SUCCESS:
        return {
          ...state,
          pinnedChannels: action.payload,
        };
      case FETCH_CHANNEL_REQUEST:
        return {
          ...state,
          isChannelLoading: true,
        };
      case FETCH_POSTS_REQUEST:
        return {
          ...state,
          posts: [],
          isPostLoading: true,
        };
      case FETCH_FOLLOWERS_REQUEST:
        return {
          ...state,
          isFollowLoading: true,
        };
      case FOLLOW_CHANNEL_REQUEST:
        return {
          ...state,
          isFollowLoading: true,
        };
      case UNFOLLOW_CHANNEL_REQUEST:
        return {
          ...state,
          isFollowLoading: true,
        };
      case FETCH_CHANNEL_SUCCESS:
        return {
          ...state,
          channel: action.payload,
          isChannelLoading: false,
        };
      case FETCH_POSTS_SUCCESS:
        return {
          ...state,
          posts: action.payload,
          isPostLoading: false,
        };
      case FETCH_FOLLOWERS_SUCCESS:
        return {
          ...state,
          followers: action.payload,
          isFollowLoading:false
        };
      case FETCH_FOLLOWINGS_SUCCESS:
        return {
          ...state,
          followings: action.payload,
          isFollowLoading:false
        };
      case FETCH_USER_FOLLOWINGS_SUCCESS:
        return {
          ...state,
          userFollowings: action.payload,
          isFollowLoading:false
        };
      case FOLLOW_CHANNEL_SUCCESS:
        return {
          ...state,
          isFollowing: true,
          isFollowLoading:false
        };
      case UNFOLLOW_CHANNEL_SUCCESS:
        return {
          ...state,
          isFollowing: false,
          isFollowLoading:false
        };
      case FETCH_CHANNEL_FAILURE:
      case FETCH_POSTS_FAILURE:
      case FETCH_FOLLOWERS_FAILURE:
      case FOLLOW_CHANNEL_FAILURE:
      case UNFOLLOW_CHANNEL_FAILURE:
        return {
          ...state,
          error: action.error,
          isChannelLoading: false,
          isPostLoading: false,
          isFollowLoading:false
        };
        case FETCH_USER_CHANNEL:
        return {
          ...state,
          userChannel: action.payload,
          isFollowLoading:false
        };
        case CLEAR_CHANNEL:
        return {
          ...state,
          userChannel: null,
          channel: null,
          posts: [],
          followers: [],
          followings:[],
          isChannelLoading: true,
          isPostLoading: true,
          isFollowLoading: false,
          error: null,
          isFollowing: false,
          pinnedChannels:[]
        };
      default:
        return state;
    }
  };
  
  export default channelReducer;
  