import {
    GET_POSTS_BOOKMARKS_REQUEST,
    GET_POSTS_BOOKMARKS_SUCCESS,
    GET_COMMENTS_BOOKMARKS_SUCCESS
  } from './bookmarkActionType';
  
  const initialState = {
    loading: false,
    postBookmarks: [],
    commentsBookmarks: [],
    error: ''
  };
  
  const bookmarkReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_POSTS_BOOKMARKS_REQUEST:
        return {
          ...state,
          loading: true
        };
      case GET_POSTS_BOOKMARKS_SUCCESS:
        return {
          ...state,
          loading: false,
          postBookmarks: action.payload,
          error: ''
        };
      case GET_COMMENTS_BOOKMARKS_SUCCESS:
        return {
          ...state,
          loading: false,
          commentsBookmarks: action.payload,
          error: ''
        };
      default:
        return state;
    }
  };
  
  export default bookmarkReducer;
  