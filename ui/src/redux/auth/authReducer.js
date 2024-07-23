import {
  SET_AUTHENTICATION,
  LOGIN_SUCCESS,
  SIGNUP_SUCCESS,
  LOGOUT_SUCCESS,
  LOADING_START,
} from "./types";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action = { type: null }) => {
  switch (action.type) {
    case LOADING_START:
      return {
        ...state,
        loading: true,
      };
    case SET_AUTHENTICATION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.data,
        loading: false,
        error: null,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export default authReducer;
