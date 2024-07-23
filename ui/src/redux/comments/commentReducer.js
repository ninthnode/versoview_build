import {
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  GET_COMMENT_REPLIES_SUCCESS,
} from "./commentType";

const initialState = {
  loading: false,
  comments: [],
  error: "",
  singleCommentReplies:{}
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_COMMENTS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_COMMENTS_SUCCESS:
      return {
        loading: false,
        comments: action.payload,
        error: "",
      };
    case GET_COMMENTS_FAILURE:
      return {
        loading: false,
        comments: [],
        error: action.payload,
      };
    case GET_COMMENT_REPLIES_SUCCESS:
      return {
        singleCommentReplies: action.payload,
      };
    default:
      return state;
  }
};

export default commentsReducer;
