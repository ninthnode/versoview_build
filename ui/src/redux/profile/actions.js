import axios from "axios";
import {
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
  USER_FETCH_FAILURE,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
} from "./types";
import { toast } from 'react-toastify';
const fetchUser = (id) => async (dispatch) => {
  dispatch({ type: USER_FETCH_REQUEST });
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getUser/${id}`,
      {
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replaceAll('"', "")}`,
        },
      }
    );
    dispatch({ type: USER_FETCH_SUCCESS, payload: response.data.user });
  } catch (error) {
    dispatch({ type: USER_FETCH_FAILURE, payload: error.message });
  }
};
const getSignedUrl = async ({ key, content_type }) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/s3/signed_profile_url`,
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
const onUploadProgress = (progressEvent) => {
  const { loaded, total } = progressEvent;
  const uploadProgress = Math.round((loaded / total) * 100);
  if (uploadProgress !== null) {
     if(uploadToastId != null) {
      toast.update(uploadToastId, {
        render: `Updating User: ${uploadProgress}%`,
        progress: uploadProgress / 100,
        autoClose: false,
      });
    }

    if (uploadProgress > 99) {
      toast.update(uploadToastId, {
        position: "bottom-right",
        render: "User Updated Sucessfully!",
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

const updateUser = (key, content_type, uploadImage, id, dataObj) => {
  return async (dispatch) => {
    dispatch({ type: USER_UPDATE_REQUEST });
    
    try {
      if (uploadToastId === null) {
        uploadToastId = toast.info(`Updating User: 0%`, {
          position: "bottom-right",
          progress: 0,
          autoClose: false,
        });
      }
      let responsefile;
      if (uploadImage) {
        const signedUrlResponse = await getSignedUrl({ key, content_type });

        const uploadResponse = await uploadFileToSignedUrl(
          signedUrlResponse.data.signedUrl,
          uploadImage,
          content_type
        );

        const newImageUrl = extractImageUrl(uploadResponse.config.url);
        dataObj.profileImageUrl = newImageUrl;
      }
      responsefile = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/updateUser/${id}`,
        dataObj,
        {
          headers: {
            authorization: `Bearer ${localStorage
              .getItem("token")
              .replaceAll('"', "")}`,
          },
        }
      );

      dispatch({
        type: USER_UPDATE_SUCCESS,
        payload: responsefile.data.user,
      });
      if (uploadToastId) 
      toast.update(uploadToastId, {
        position: "bottom-right",
        render: "User Updated Sucessfully!",
        progress: 100,
        type: 'success',
        autoClose: 5000,
      });
      return responsefile.data.user.profileImageUrl; 
    } catch (error) {
      dispatch({ type: USER_UPDATE_FAILURE, payload: error.message });
      throw error;
    }
  };
};


export { fetchUser, updateUser };
