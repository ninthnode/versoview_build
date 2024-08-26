import {
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  GET_COMMENT_REPLIES_SUCCESS,
  GET_COMMENT_AND_REPLIES_COUNT,
  OPEN_COMMENTS_MODAL,
  CLOSE_COMMENTS_MODAL,
} from "./commentType";

const initialState = {
  loading: false,
  comments: [],
  error: "",
  postTotalComments: 0,
  singleCommentReplies: {},
  isModalCommentsOpen:false
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
        ...state,
        loading: false,
        comments: action.payload,
        error: "",
      };
    case GET_COMMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        comments: [],
        error: action.payload,
      };
    case GET_COMMENT_REPLIES_SUCCESS:
      return {
        ...state,
        singleCommentReplies: action.payload,
      };
    case GET_COMMENT_AND_REPLIES_COUNT:
      return {
        ...state,
        postTotalComments: action.payload.commentCount+action.payload.repliesCount,
      };
    case OPEN_COMMENTS_MODAL:
      return {
        ...state,
        isModalCommentsOpen: true,
      };
    case CLOSE_COMMENTS_MODAL:
      return {
        ...state,
        isModalCommentsOpen: false,
      };
    default:
      return state;
  }
};

export default commentsReducer;
