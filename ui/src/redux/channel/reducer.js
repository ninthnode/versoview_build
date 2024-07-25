import {
  GET_CHANNEL_DATA,
  GET_CHANNEL_POSTS,
  FOLLOW_CHANNEL,
  UNFOLLOW_CHANNEL,
  GET_FOLLOWINGS,
} from "./types";

const channelReducer = (
  state = { data: {}, posts: [], following: [] },
  action = { type: null }
) => {
  switch (action.type) {
    case GET_CHANNEL_DATA:
      return {
        ...state,
        data: action.payload,
      };
    case GET_CHANNEL_POSTS:
      return {
        ...state,
        posts: action.payload,
      };
    case FOLLOW_CHANNEL:
      return {
        ...state,
        // posts: action.payload,
      };
    case UNFOLLOW_CHANNEL:
      return {
        ...state,
        // posts: action.payload,
      };
    case GET_FOLLOWINGS:
      return {
        ...state,
        following: action.payload,
      };

    // case FOLLOW_CHANNEL:
    //  return {
    //   ...state,
    //   isFollowing:
    //  }
    default:
      return state;
  }
};

export default channelReducer;
