import axios from "axios";
import {
    CREATE_EDITION_REQUEST,
    CREATE_EDITION_SUCCESS,
    GET_EDITIONS_REQUEST,
    GET_EDITIONS_SUCCESS,
    GET_SINGLE_EDITION_REQUEST,
    GET_SINGLE_EDITION_SUCCESS
  } from './publishTypes';
  import { toast } from 'react-toastify';

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
          render: `Creating Edition: ${uploadProgress}%`,
          progress: uploadProgress / 100,
          autoClose: false,
        });
      }
  
      if (uploadProgress) {
        toast.update(uploadToastId, {
          position: "bottom-right",
          render: "Edition Created Sucessfully!",
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
  export const createEdition = (key, content_type, uploadPdf, editionData) => async (dispatch) => {
    try {
      dispatch({ type: CREATE_EDITION_REQUEST });
      if (uploadToastId === null) {
        uploadToastId = toast.info(`Creating Edition: 0%`, {
          position: "bottom-right",
          progress: 0,
          autoClose: false,
        });
      }
      let responsefile;
      if (uploadPdf) {
        const signedUrlResponse = await getSignedUrl({ key, content_type });

        const uploadResponse = await uploadFileToSignedUrl(
          signedUrlResponse.data.signedUrl,
          uploadPdf,
          content_type
        );

        const newPdfUrl = extractImageUrl(uploadResponse.config.url);
        editionData.pdfUrl = newPdfUrl;
      }
      responsefile = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/create-edition`,
        editionData,
        {
          headers: {
            authorization: `Bearer ${localStorage
              .getItem("token")
              .replaceAll('"', "")}`,
          },
        }
      );

      dispatch({
        type: CREATE_EDITION_SUCCESS,
        payload: responsefile,
      });
      window.location.href = "/publish";
    } catch (error) {
      console.log(error)
    }
  };
  
  export const getAllEditions = () => async (dispatch) => {
    try {
      dispatch({ type: GET_EDITIONS_REQUEST });
     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getAll`,{ 
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replaceAll('"', "")}`,
        },
      });

      dispatch({
        type: GET_EDITIONS_SUCCESS,
        payload: response.data.data,
      });
    } catch (error) {
      console.log(error)
    }
  };

  export const getEditionById = (editionId) => async (dispatch) => {
    try {
      dispatch({ type: GET_SINGLE_EDITION_REQUEST });
     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getEditionById/${editionId}`,{ 
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replaceAll('"', "")}`,
        },
      });
      dispatch({
        type: GET_SINGLE_EDITION_SUCCESS,
        payload: response.data.data,
      });
    } catch (error) {
      console.log(error)
    }
  };
  