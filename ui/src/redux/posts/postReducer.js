import { GET_POSTS_REQUEST, GET_POSTS_SUCCESS, GET_POSTS_FAILURE,
  GET_SINGLE_POST_SUCCESS,
  GET_SINGLE_POST_VOTES_SUCCESS,
  GET_RECENT_POSTS_SUCCESS,
  SET_POST_EDIT } from './postType';

const initialState = {
  loading: false,
  posts: [],
  error: '',
  singlePost:{},
  postVotes:[],
  recentPosts:[],
  isEditPost:false,
  editPostId:'',
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: action.payload,
        error: '',
      };
    case GET_RECENT_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentPosts: action.payload,
        error: '',
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
          error: '',
        };
      case GET_SINGLE_POST_VOTES_SUCCESS:
        return {
          ...state,
          postVotes:action.payload
        };
      case SET_POST_EDIT:
        return {
          ...state,
          isEditPost:action.payload.isEditPost,
          editPostId:action.payload.postId,
        };
    default:
      return state;
  }
};

export default postsReducer;
