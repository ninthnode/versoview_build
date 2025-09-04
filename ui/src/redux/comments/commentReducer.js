import {
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_FAILURE,
  GET_COMMENT_REPLIES_SUCCESS,
  GET_COMMENT_AND_REPLIES_COUNT,
  OPEN_COMMENTS_MODAL,
  CLOSE_COMMENTS_MODAL,
  NEXT_PAGE,
  PREVIOUS_PAGE,
  DELETE_COMMENT_SUCCESS
} from "./commentType";

const initialState = {
  loading: false,
  comments: [],
  error: "",
  postTotalComments: 0,
  singleCommentReplies: {},
  pageNumber: 0,
  pagesData:{},
  commentStateUpdateCount:0,
  isModalCommentsOpen:false,
  modalComment:{},
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
        comments: action.payload,
        commentStateUpdateCount:state.commentStateUpdateCount+1
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
        comments:action.payload
      };
    case CLOSE_COMMENTS_MODAL:
      return {
        ...state,
        isModalCommentsOpen: false,
        comments:[]
      };
    case NEXT_PAGE:
      return {
        ...state,
        pagesData: action.payload.arr,
        pageNumber:action.payload.page
      };
    case PREVIOUS_PAGE:
      return {
        ...state,
        // pagesData: action.payload,
        pageNumber:state.pageNumber-1
      };
    case DELETE_COMMENT_SUCCESS:
      return {
        ...state,
        comments: action.payload,
        commentStateUpdateCount:state.commentStateUpdateCount+1
      };
    default:
      return state;
  }
};

export default commentsReducer;
