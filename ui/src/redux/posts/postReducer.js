import {
  GET_POSTS_REQUEST,
  GET_POSTS_SUCCESS,
  GET_POSTS_FAILURE,
  GET_SINGLE_POST_SUCCESS,
  CLEAR_SINGLE_POST,
  CLEAR_SINGLE_POST_EDITDATA,
  GET_SINGLE_POST_VOTES_SUCCESS,
  GET_RECENT_POSTS_SUCCESS,
  SET_POST_EDIT,
  GET_SINGLE_POST_EDITDATA_SUCCESS,
  POST_ADD_SUCCESS,
  POST_EDIT_SUCCESS,
  MODIFY_POSTS_REQUEST,
  WITHOUT_EDITION_POSTS_SUCCESS
} from "./postType";

const initialState = {
  loading: true,
  loadingModify: false,
  posts: [],
  error: "",
  singlePost: {},
  postVotes: [],
  recentPosts: [],
  isEditPost: false,
  editPostId: "",
  singlePostEditContent: {},
  withoutEditionPosts: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  },
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case MODIFY_POSTS_REQUEST:
      return {
        ...state,
        loadingModify: true,
      };
    case GET_POSTS_SUCCESS:
      const { posts, pagination, page } = action.payload;
      return {
        ...state,
        loading: false,
        posts: page === 1 ? posts : [...state.posts, ...posts],
        pagination: pagination,
        error: "",
      };
    case CLEAR_SINGLE_POST:
      return {
        ...state,
        loading: false,
        singlePost: [],
        error: "",
      };
    case CLEAR_SINGLE_POST_EDITDATA:
      return {
        ...state,
        loading: false,
        singlePostEditContent: {},
        error: "",
      };
    case GET_RECENT_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentPosts: action.payload,
        error: "",
      };
    case GET_POSTS_FAILURE:
      return {
        ...state,
        loading: false,
        posts: [],
        error: action.payload,
      };
    case GET_SINGLE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        singlePost: action.payload,
        error: "",
      };
    case GET_SINGLE_POST_VOTES_SUCCESS:
      return {
        ...state,
        postVotes: action.payload,
      };
    case GET_SINGLE_POST_EDITDATA_SUCCESS:
      return {
        ...state,
        loading: false,
        singlePostEditContent: action.payload,
        error: "",
      };
    case SET_POST_EDIT:
      return {
        ...state,
        isEditPost: action.payload.isEditPost,
        editPostId: action.payload.postId,
      };
    case POST_ADD_SUCCESS:
    case POST_EDIT_SUCCESS:
      return {
        ...state,
        loadingModify: false,
      };
    case WITHOUT_EDITION_POSTS_SUCCESS:
      return {
        ...state,
        withoutEditionPosts: action.payload,
      };
    default:
      return state;
  }
};

export default postsReducer;