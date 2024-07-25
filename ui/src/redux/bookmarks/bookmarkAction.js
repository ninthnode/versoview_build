import {
  GET_POSTS_BOOKMARKS_REQUEST,
  GET_POSTS_BOOKMARKS_SUCCESS,
  GET_COMMENTS_BOOKMARKS_SUCCESS
} from "./bookmarkActionType";
import axios from "axios";
import { fetchPosts } from "@/redux/posts/postActions";

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
export const addRemoveBookmarks = (bookmarktype,postId) => {
  return async (dispatch) => {
    // dispatch(getPostsBookmarksRequest());
    console.log(bookmarktype,postId)
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/addBookmark/${postId}`,{type:bookmarktype},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data
    } catch (error) {
      console.log(error);
    }
  };
};
