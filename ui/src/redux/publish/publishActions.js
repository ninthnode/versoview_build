import axios from "axios";
import {
    CREATE_EDITION_REQUEST,
    CREATE_EDITION_SUCCESS,
    GET_EDITIONS_REQUEST,
    GET_EDITIONS_SUCCESS,
    GET_SINGLE_EDITION_REQUEST,
    GET_SINGLE_EDITION_SUCCESS,
    GET_USER_EDITION_REQUEST,
    GET_USER_EDITION_SUCCESS,
    UPLOAD_PDF_PROGRESS,
    UPLOAD_IMAGES_PROGRESS,
    CLEAN_EDITION
  } from './publishTypes';
  import { toast } from 'react-toastify';

  export const cleanEdition = () => ({ type: CLEAN_EDITION });
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
  const extractImageUrl = (url) => {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split("/");
    const filename = segments.pop();
    return url.substring(0, url.indexOf(filename) + filename.length);
  };
 
  const onUploadProgress = (progressEvent, fileIndex, fileProgress, setAggregateProgress, totalSize) => {
    const { loaded, total } = progressEvent;
  
    // Calculate the progress for the current file
    const fileProgressPercentage = (loaded / total) * 50;
  
    // Update the progress for the specific file
    fileProgress[fileIndex] = (loaded / totalSize) * 50;
  
    // Aggregate progress from all files
    const aggregateProgress = Object.values(fileProgress).reduce((sum, progress) => sum + progress, 0);
  
    // Update the overall progress
    setAggregateProgress(aggregateProgress);
  };
  
  async function processFiles(files, setAggregateProgress, type) {
    const fileUrls = [];
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  
    // Track individual progress for each file
    const fileProgress = {};
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const key = `${type}/${file.name}`;
        const content_type = file.type;
        const signedUrlResponse = await getSignedUrl({ key, content_type });
  
        await axios.put(signedUrlResponse.data.signedUrl, file, {
          headers: { "Content-Type": content_type },
          onUploadProgress: (progressEvent) =>
            onUploadProgress(progressEvent, i, fileProgress, setAggregateProgress, totalSize),
        });
  
        const newFileUrl = extractImageUrl(signedUrlResponse.data.signedUrl);
        fileUrls.push(newFileUrl);
      } catch (error) {
        console.error(`Failed to upload file: ${file.name}`, error);
        throw new Error(`Error uploading file: ${file.name}`);
      }
    }
  
    return fileUrls;
  }
  
  export const createEdition = (chunkPdfFiles, capturedPdfImages, editionData) => async (dispatch) => {
    try {
      dispatch({ type: "CREATE_EDITION_REQUEST" });
  
      // Aggregate progress for all file uploads
      let aggregateProgress = 0;
      const setAggregateProgress = (progress) => {
        aggregateProgress = progress;
        dispatch({
          type: UPLOAD_PDF_PROGRESS,
          payload: aggregateProgress,
        });
      };
  
      // Process PDF files
      const processedPdfs = await processFiles(chunkPdfFiles, setAggregateProgress, "pdf");
      editionData.pdfUrls = processedPdfs;
  
      // Reset progress for images
      let aggregateImageProgress = 0;
      const setAggregateImageProgress = (progress) => {
        aggregateImageProgress = progress;
        dispatch({
          type: UPLOAD_IMAGES_PROGRESS,
          payload: aggregateImageProgress,
        });
      };
      
      // Process Image files
      const processedImages = await processFiles(capturedPdfImages, setAggregateImageProgress, "images");
      editionData.libraryImages = processedImages;
  
      // Send final edition data
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/create-edition`,
        editionData,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
          },
        }
      );
  
      dispatch({
        type: "CREATE_EDITION_SUCCESS",
        payload: response.data,
      });
  
      // Redirect or other post-success actions
      window.location.href = "/publish";
    } catch (error) {
      console.error("Error creating edition:", error);
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
  export const getEditionsByUserID = (userId) => async (dispatch) => {
    try {
      dispatch({ type: GET_USER_EDITION_REQUEST });
      console.log(userId)
     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getEditionsByUserId/${userId}`);
      dispatch({
        type: GET_USER_EDITION_SUCCESS,
        payload: response.data.data,
      });
    } catch (error) {
      console.log(error)
    }
  };
  
  export const deleteEdition = (editionId) => {
    return async (dispatch) => {
      try {
        const token = localStorage.getItem("token").replaceAll('"', "");
  
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/deleteEdition/${editionId}`,{ 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast(response.data.message,{
          autoClose: 3000,
          type:'success'
        })
      } catch (error) {
       }
    };
  };

  export const getEditionPdf = (editionId,pageStart,pagesPerLoad) => async (dispatch) => {
    try {
      dispatch({ type: GET_SINGLE_EDITION_REQUEST });
     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getPdf/${editionId}?pageStart=${pageStart}&pageEnd=${pageStart + pagesPerLoad - 1}`,{ 
        headers: {
          authorization: `Bearer ${localStorage
            .getItem("token")
            .replaceAll('"', "")}`,
        },
      });

      return response
    } catch (error) {
      console.log(error)
    }
  };