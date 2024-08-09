import axios from "axios";
import {
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
  USER_FETCH_FAILURE,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
} from "./types";

const fetchUser = (id) => async (dispatch) => {
  dispatch({ type: USER_FETCH_REQUEST });
  try {
    console.log(id);
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

const uploadFileToSignedUrl = (
  signedUrl,
  file,
  contentType,
  onProgress,
  onComplete
) => {
  axios
    .put(signedUrl, file, {
      onUploadProgress: onProgress,
      headers: {
        "Content-Type": contentType,
      },
    })
    .then(onComplete)
    .catch((err) => {
      console.error(err.response);
    });
};
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
      if (uploadImage) {
        getSignedUrl({ key, content_type }).then((response) => {
          uploadFileToSignedUrl(
            response.data.signedUrl,
            uploadImage,
            content_type,
            null,
            async (response2) => {
              let newImageUrl = extractImageUrl(response2.config.url);
              dataObj.profileImageUrl = newImageUrl;
              const responsefile = await axios.put(
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
            }
          );
        });
      } else {
        const responsefile = await axios.put(
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
      }
    } catch (error) {
      dispatch({ type: USER_UPDATE_FAILURE, payload: error.message });
    }
  };
};

export { fetchUser, updateUser };
