import { GET_POSTS_REQUEST, GET_POSTS_SUCCESS, GET_POSTS_FAILURE,
  GET_SINGLE_POST_SUCCESS,
  GET_RECENT_POSTS_SUCCESS,
  GET_SINGLE_POST_VOTES_SUCCESS } from './postType';
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
        
      console.log(response)
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

const uploadFileToSignedUrl = (
  signedUrl,
  file,
  contentType,
  onProgress,
  onComplete
) => {
  axios
    .put(signedUrl, file, {
      onUploadProgress: onUploadProgress,
      headers: {
        "Content-Type": contentType,
      },
    })
    .then(onComplete)
    .catch((err) => {
      console.error(err.response);
    });
};
let uploadToastId = null;
const onUploadProgress = (progressEvent) => {
  const { loaded, total } = progressEvent;
  const uploadProgress = Math.round((loaded / total) * 100);
  if (uploadProgress !== null) {
    if (uploadToastId === null) {
      uploadToastId = toast.info(`Creating Post: ${uploadProgress}%`, {
        position: "bottom-right",
        progress: uploadProgress / 100,
        autoClose: false,
      });
    } else {
      toast.update(uploadToastId, {
        render: `Creating Post: ${uploadProgress}%`,
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
export const createNewPost = (key,content_type,uploadedImage,formData) => {
  return async (dispatch) => {
    dispatch(getPostsRequest());
    try {
      getSignedUrl({ key, content_type }).then((response) => {

        uploadFileToSignedUrl(
          response.data.signedUrl,
          uploadedImage,
          content_type,
          null,
          async (response2) => {
            let newImageUrl = extractImageUrl(response2.config.url);
            formData.mainImageURL = newImageUrl;

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
            window.location.href = "/home";
          }
        );
      });

    } catch (error) {
      // dispatch(getPostsFailure(error.message));
    }
  };
};