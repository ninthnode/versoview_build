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
    CLEAN_EDITION,
    GET_LIBRARY_IMAGES_REQUEST,
    GET_LIBRARY_IMAGES_SUCCESS,
    UPLOAD_LIBRARY_IMAGE_REQUEST,
    UPLOAD_LIBRARY_IMAGE_SUCCESS,
    GET_LIBRARY_IMAGES_FAILURE,
    UPLOAD_LIBRARY_IMAGE_FAILURE
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
  
  const onUploadProgress = (
    progressEvent,
    fileIndex,
    uploadedBytesPerFile,
    setProcessProgress,
    totalSize
  ) => {
    const { loaded } = progressEvent; // Bytes uploaded for the current file
  
    // Update the uploaded bytes for the current file
    uploadedBytesPerFile[fileIndex] = loaded;
  
    // Calculate total uploaded bytes across all files
    const totalUploadedBytes = Object.values(uploadedBytesPerFile).reduce(
      (sum, bytes) => sum + bytes,
      0
    );
  
    // Calculate progress for this process
    const processProgress = (totalUploadedBytes / totalSize) * 100;
  
    // Update the process-specific progress
    setProcessProgress(processProgress);
  };
  
  async function processFiles(files, setProcessProgress, type) {
    const fileUrls = [];
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  
    // Track uploaded bytes for each file
    const uploadedBytesPerFile = {};
  
    // Set up concurrency control
    const concurrencyLimit = 3; // Process 3 files at once
  
    // Initialize progress for all files
    files.forEach((_, index) => {
      uploadedBytesPerFile[index] = 0;
    });

    // Process files in batches with controlled concurrency
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchIndexes = Array.from(
        { length: batch.length },
        (_, index) => i + index
      );
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (file, batchIndex) => {
          const fileIndex = batchIndexes[batchIndex];
          try {
            const key = `${type}/${file.name}`;
            const content_type = file.type;
            const signedUrlResponse = await getSignedUrl({ key, content_type });

            // Upload to S3 with progress tracking
            await axios.put(signedUrlResponse.data.signedUrl, file, {
              headers: { "Content-Type": content_type },
              onUploadProgress: (progressEvent) =>
                onUploadProgress(
                  progressEvent,
                  fileIndex,
                  uploadedBytesPerFile,
                  setProcessProgress,
                  totalSize
                ),
            });

            return extractImageUrl(signedUrlResponse.data.signedUrl);
          } catch (error) {
            console.error(`Failed to upload file: ${file.name}`, error);
            throw new Error(`Error uploading file: ${file.name}`);
          }
        })
      );
      
      // Add successful uploads to the results
      fileUrls.push(...batchResults);
    }
  
    return fileUrls;
  }
  
  export const createEdition = (chunkPdfFiles, capturedPdfImages, mergedImages, editionData,totalSizeInMB) => async (dispatch) => {
    try {
      dispatch({ type: CREATE_EDITION_REQUEST });
  
      // Separate progress states for PDFs and images
      let pdfProgress = 0;
      let imageProgress = 0;
      let mergedImageProgress = 0;
      const setPdfProgress = (progress) => {
        pdfProgress = progress;
        updateAggregateProgress(); // Update combined progress
      };
  
      const setImageProgress = (progress) => {
        imageProgress = progress;
        updateAggregateProgress(); // Update combined progress
      };
      const setMergedImageProgress = (progress) => {
        mergedImageProgress = progress;
        updateAggregateProgress();
      };
      const updateAggregateProgress = () => {
        const aggregateProgress = (
          (pdfProgress * 0.4) +  // 40% weight
          (imageProgress * 0.4) + // 40% weight
          (mergedImageProgress * 0.2)  // 20% weight
        );

        dispatch({
          type: UPLOAD_PDF_PROGRESS,
          payload: aggregateProgress,
        });
      };
  
      // Process PDF files (40% weight)
      const processedPdfs = await processFiles(chunkPdfFiles, setPdfProgress, "pdf");
      editionData.pdfUrls = processedPdfs;
  
      // Process Image files (40% weight)
      const processedImages = await processFiles(capturedPdfImages, setImageProgress, "images");
      editionData.libraryImages = processedImages;

      // Process merged images (20% weight)
      const processedMergedImages = await processFiles(mergedImages, setMergedImageProgress, "images");
      editionData.mergedImages = processedMergedImages;

      editionData.size = totalSizeInMB;
  
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
        type: CREATE_EDITION_SUCCESS,
        payload: response.data,
      });
  
      // Redirect or other post-success actions
      window.location.href = "/publish";
    } catch (error) {
      console.error("Error creating edition:", error);
      // dispatch({ type: "CREATE_EDITION_FAILURE", error });
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



  export const getLibraryImages = (editionId) => async (dispatch) => {
    try {
      dispatch({ type: GET_LIBRARY_IMAGES_REQUEST });
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getLibraryImages/${editionId}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
          },
        }
      );
      dispatch({
        type: GET_LIBRARY_IMAGES_SUCCESS,
        payload: response?.data?.images,
      });
    } catch (error) {
      console.error("Error fetching library images:", error);
      dispatch({
        type: GET_LIBRARY_IMAGES_FAILURE,
        payload: error.response?.data?.message || "Failed to fetch library images",
      });
    }
  };
  export const getLibraryImagesForPageTurner = (editionId) => async (dispatch) => {
    try {
      dispatch({ type: GET_LIBRARY_IMAGES_REQUEST });
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getLibraryImagesForPageTurner/${editionId}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
          },
        }
      );
      dispatch({
        type: GET_LIBRARY_IMAGES_SUCCESS,
        payload: response?.data?.data,
      });
    } catch (error) {
      console.error("Error fetching library images:", error);
      dispatch({
        type: GET_LIBRARY_IMAGES_FAILURE,
        payload: error.response?.data?.message || "Failed to fetch library images",
      });
    }
  };

  export const uploadLibraryImage = (key, content_type, file, editionId) => async (dispatch) => {
    try {
      dispatch({ type: UPLOAD_LIBRARY_IMAGE_REQUEST });
      
      // Get signed URL
      const signedUrlResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/s3/signed_url`,
        { key, content_type }
      );

      // Upload to S3
      await axios.put(signedUrlResponse.data.data.signedUrl, file, {
        headers: { "Content-Type": content_type },
      });

      // Extract the base URL from the signed URL
      const signedUrl = new URL(signedUrlResponse.data.data.signedUrl);
      const baseUrl = `${signedUrl.protocol}//${signedUrl.host}${signedUrl.pathname}`;

      // Save to backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/uploadLibraryImage/${editionId}`,
        { url: baseUrl },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
          },
        }
      );
      console.log(response.data.libraryImages)
      dispatch({
        type: UPLOAD_LIBRARY_IMAGE_SUCCESS,
        payload: response.data.libraryImages,
      });

      return response.data.libraryImages;
    } catch (error) {
      console.error("Error uploading library image:", error);
      dispatch({
        type: UPLOAD_LIBRARY_IMAGE_FAILURE,
        payload: error.response?.data?.message || "Failed to upload library image",
      });
      throw error;
    }
  };


