import {
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
  USER_FETCH_FAILURE,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
  USER_REWARDS_SUCCESS
} from "./types";

const initialState = {
  loading: false,
  user: null,
  error: null,
  userRewards: null
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_FETCH_REQUEST:
    case USER_UPDATE_REQUEST:
      return { ...state, loading: true, error: null };
    case USER_FETCH_SUCCESS:
    case USER_UPDATE_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case USER_FETCH_FAILURE:
    case USER_UPDATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case USER_REWARDS_SUCCESS:
      return { ...state, userRewards: action.payload };
    default:
      return state;
  }
};


export default profileReducer;
