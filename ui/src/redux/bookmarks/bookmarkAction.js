import {
  GET_POSTS_BOOKMARKS_REQUEST,
  GET_POSTS_BOOKMARKS_SUCCESS,
  GET_COMMENTS_BOOKMARKS_SUCCESS
} from "./bookmarkActionType";


import {
  GET_COMMENT_REPLIES_SUCCESS,
  NEXT_PAGE
} from "../comments/commentType";
import axios from "axios";
import { fetchPosts } from "@/redux/posts/postActions";
import { toast } from 'react-toastify';
// Action creator for initiating the fetch
export const getPostsBookmarksRequest = () => ({
  type: GET_POSTS_BOOKMARKS_REQUEST,
});

// Action creator for a successful fetch
export const getPostsBookmarksSuccess = (bookmarks) => ({
  type: GET_POSTS_BOOKMARKS_SUCCESS,
  payload: bookmarks,
});
export const getCommentsBookmarksSuccess = (bookmarks) => ({
  type: GET_COMMENTS_BOOKMARKS_SUCCESS,
  payload: bookmarks,
});

// Thunk action for fetching bookmarks
export const fetchBookmarks = () => {
  return async (dispatch) => {
    dispatch(getPostsBookmarksRequest());
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getBookmark`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data.data;
      dispatch(getPostsBookmarksSuccess(data));
    } catch (error) {
      console.log(error);
    }
  };
};


const updateCommentInNestedReplies = async (comments, commentId, bool) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];

    // If the current comment matches the commentId, update it
    if (comment._id === commentId) {
      comment.isBookmarked = bool;
      return comments;
    }

    // If it has replies, continue searching in the nested replies
    if (Array.isArray(comment.replies) && comment.replies.length > 0) {
      const updatedReplies = await updateCommentInNestedReplies(comment.replies, commentId, bool);
      if (updatedReplies) return comments;
    }
  }
  return null;
};


export const addRemoveBookmarks = (bookmarktype,id,bool=null) => {
  return async (dispatch,getState) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
    
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/addBookmark/${id}`,{type:bookmarktype},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { comment } = getState();
      if(bookmarktype==='comment'){
        const updatedComments=  await updateCommentInNestedReplies(comment.comments,id,bool) 
        if(comment.pageNumber>0){
          const updatedComments2=  await updateCommentInNestedReplies(comment.pagesData[comment.pageNumber-1],id,bool) 
        }
        dispatch({
         type: GET_COMMENT_REPLIES_SUCCESS,
         payload: updatedComments
       });
      }
      toast(response.data.message,{
        autoClose: 3000,
        type:'success'
      })
      return response.data
    } catch (error) {
      console.log(error);
    }
  };
};
