import { GET_POSTS_REQUEST, GET_POSTS_SUCCESS, GET_POSTS_FAILURE,
  GET_SINGLE_POST_SUCCESS,
  CLEAR_SINGLE_POST,
  GET_RECENT_POSTS_SUCCESS,
  SET_POST_EDIT,
  GET_SINGLE_POST_EDITDATA_SUCCESS,POST_ADD_SUCCESS,
  POST_EDIT_SUCCESS,MODIFY_POSTS_REQUEST } from './postType';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const getPostsRequest = () => ({
  type: GET_POSTS_REQUEST,
});

export const getPostsSuccess = (posts) => ({
  type: GET_POSTS_SUCCESS,
  payload: posts,
});

export const getPostsFailure = (error) => ({
  type: GET_POSTS_FAILURE,
  payload: error,
});

export const setPostEdit = (isEditPost,postId) => ({
  type: SET_POST_EDIT,
  payload: {isEditPost,postId},
});

export const fetchPosts = () => {
  return async (dispatch,getState) => {
    const { auth } = getState();
    dispatch(getPostsRequest());
    try {
      let response={}
      if (auth.isAuthenticated){
        const token = localStorage.getItem("token").replaceAll('"', "");

        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getAllPost`,{ 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      }
      else{
        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostIfUserNotLoggedIn`);
      }
      const data = await response.data.data
      dispatch(getPostsSuccess(data));
    } catch (error) {
      dispatch(getPostsFailure(error.message));
    }
  };
};
export const fetchRecentlyViewedPosts = () => {
  return async (dispatch,getState) => {
    dispatch(getPostsRequest());
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getRecentlyViewedPosts`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      const data = await response.data.data
      dispatch({
        type: GET_RECENT_POSTS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch(getPostsFailure(error.message));
    }
  };
};
export const clearPost = () => {
  return async (dispatch,getState) => {
  dispatch({
    type:CLEAR_SINGLE_POST
  });
  }
}
export const getPostById = (postId) => {
  return async (dispatch,getState) => {
    dispatch(getPostsRequest());
    const { auth } = getState();

    try {
      let response
      if (auth.isAuthenticated){
        const token = localStorage.getItem("token").replaceAll('"', "");
       response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPost/${postId}`, { 
        headers: {
        Authorization: `Bearer ${token}`,
        }
      });
    }else{
      response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostByIdLoggedOut/${postId}`);
    }
      const data = await response.data.data
      dispatch({
        type: GET_SINGLE_POST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};
export const getPostByIdEditData = (postId) => {
  return async (dispatch,getState) => {
    dispatch(getPostsRequest());
    const { auth } = getState();

    try {
      let response
      if (auth.isAuthenticated){
        const token = localStorage.getItem("token").replaceAll('"', "");
       response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getPostById/${postId}`, { 
        headers: {
        Authorization: `Bearer ${token}`,
        }
      });
    }
      const data = await response.data.data
      dispatch({
        type: GET_SINGLE_POST_EDITDATA_SUCCESS,
        payload: data,
      });
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};

export const updatePostUpvote = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/upVote/${postId}`,
        {},
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getPostsRequest());
      toast('Post '+response.data.message,{
        autoClose: 3000,
        type:'success'
      })
    } catch (error) {
    }
  };
};
export const updatePostDownvote = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/downVote/${postId}`,
        {},
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getPostsRequest());
      toast('Post '+response.data.message,{
        autoClose: 3000,
        type:'success'
      })
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};


const getSignedUrl = async ({ key, content_type }) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/s3/signed_url`,
    {
      key,
      content_type,
    }
  );
  return response.data;
};

const uploadFileToSignedUrl = (signedUrl, file, contentType, onProgress) => {
  return axios.put(signedUrl, file, {
    onUploadProgress: onUploadProgress,
    headers: {
      "Content-Type": contentType,
    },
  });
};
let uploadToastId = null;
let isEditing = false;
const onUploadProgress = (progressEvent) => {
  const { loaded, total } = progressEvent;
  const uploadProgress = Math.round((loaded / total) * 100);
  if (uploadProgress !== null) {
    if (uploadToastId === null) {
      uploadToastId = toast.info(isEditing?`Editing Post: ${uploadProgress}%`:`Creating Post: ${uploadProgress}%`, {
        position: "bottom-right",
        progress: uploadProgress / 100,
        autoClose: false,
      });
    } else {
      toast.update(uploadToastId, {
        render: isEditing?`Editing Post: ${uploadProgress}%`:`Creating Post: ${uploadProgress}%`,
        progress: uploadProgress / 100,
        autoClose: false,
      });
    }

    if (uploadProgress === 100) {
      toast.update(uploadToastId, {
        position: "bottom-right",
        render: "Post Created Sucessfully!",
        progress: 100,
        type: 'success',
        autoClose: 5000,
      });
    }
  }
}
const extractImageUrl = (url) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const segments = pathname.split("/");
  const filename = segments.pop();
  return url.substring(0, url.indexOf(filename) + filename.length);
};
export const createNewPost = (key,content_type,image,formData) => {
  return async (dispatch) => {
    await dispatch({
      type: MODIFY_POSTS_REQUEST
    });
    try {
      if (image) {
        const signedUrlResponse = await getSignedUrl({ key, content_type });

        const uploadResponse = await uploadFileToSignedUrl(
          signedUrlResponse.data.signedUrl,
          image,
          content_type
        );

        const newImageUrl = extractImageUrl(uploadResponse.config.url);
        formData.mainImageURL = newImageUrl;
      }
      else{
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL+'/images/default-post-img.jpg')
        formData.mainImageURL = process.env.NEXT_PUBLIC_BACKEND_URL+'/images/default-post-img.jpg';
      }

      const token = localStorage.getItem("token").replaceAll('"', "");
      const responsefile = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/createPost`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await dispatch({
        type: POST_ADD_SUCCESS
      });
      window.location.href = "/home";

    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};
export const editPost = (key,content_type,image,formData,editPostId) => {
  return async (dispatch,getState) => {
    await dispatch({
      type: MODIFY_POSTS_REQUEST
    });
    try {
      const isEditPost = getState((s) => s.post.isEditPost);
      if(isEditPost){
        isEditing =true
      }
      if (image) {
        const signedUrlResponse = await getSignedUrl({ key, content_type });

        const uploadResponse = await uploadFileToSignedUrl(
          signedUrlResponse.data.signedUrl,
          image,
          content_type
        );

        const newImageUrl = extractImageUrl(uploadResponse.config.url);
        formData.mainImageURL = newImageUrl;
      }
      else{
        formData.mainImageURL = process.env.NEXT_PUBLIC_BACKEND_URL+'/images/default-post-img.jpg';
      }

      const token = localStorage.getItem("token").replaceAll('"', "");
      const responsefile = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/updatePost/${editPostId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      await dispatch({
        type: POST_EDIT_SUCCESS
      });
      window.location.href = "/home";

    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};

export const deletePost = (postId) => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");

      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/deletePost/${postId}`,{ 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast(response.data.message,{
        autoClose: 3000,
        type:'success'
      })
    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};