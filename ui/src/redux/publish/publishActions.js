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
    LIBRARY_IMAGE_PROGRESS,
    LIBRARY_IMAGE_SUCCESS,
    GET_LIBRARY_IMAGES_REQUEST,
    GET_LIBRARY_IMAGES_SUCCESS,
    GET_LIBRARY_IMAGES_FAILURE,
    UPLOAD_NEW_LIBRARY_IMAGE_REQUEST,
    UPLOAD_NEW_LIBRARY_IMAGE_SUCCESS,
    UPLOAD_NEW_LIBRARY_IMAGE_FAILURE
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
  
  export const createEdition = (chunkPdfFiles, capturedPdfImages, editionData,totalSizeInMB) => async (dispatch) => {
    try {
      dispatch({ type: CREATE_EDITION_REQUEST });
  
      // Separate progress states for PDFs and images
      let pdfProgress = 0;
      let imageProgress = 0;
  
      const setPdfProgress = (progress) => {
        pdfProgress = progress;
        updateAggregateProgress(); // Update combined progress
      };
  
      const setImageProgress = (progress) => {
        imageProgress = progress;
        updateAggregateProgress(); // Update combined progress
      };
  
      const updateAggregateProgress = () => {
        const aggregateProgress = (pdfProgress * 0.5) + (imageProgress * 0.5); // Combine progress (50% each)
        dispatch({
          type: UPLOAD_PDF_PROGRESS,
          payload: aggregateProgress,
        });
      };
  
      // Process PDF files (50% weight)
      const processedPdfs = await processFiles(chunkPdfFiles, setPdfProgress, "pdf");
      editionData.pdfUrls = processedPdfs;
  
      // Process Image files (50% weight)
      const processedImages = await processFiles(capturedPdfImages, setImageProgress, "images");
      editionData.libraryImages = processedImages;

      
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


  
const uploadFileToSignedUrl = (signedUrl, file, contentType,dispatch) => {
  return axios.put(signedUrl, file, {
    onUploadProgress: (progressEvent)=>{
      const { loaded, total } = progressEvent;
      const uploadProgress = Math.round((loaded / total) * 100);
      dispatch({
        type: LIBRARY_IMAGE_PROGRESS,
        payload: uploadProgress,
      });
    },
    headers: {
      "Content-Type": contentType,
    },
  });
};

  export const uploadLibraryImage = (key, content_type, image, editionId) => {
    return async (dispatch, getState) => {
      try {
        console.log(`===== UPLOAD LIBRARY IMAGE =====`);
        console.log(`Uploading image with editionId: ${editionId}`);
        
        // Validate required parameters
        if (!editionId) {
          console.error("Missing editionId in uploadLibraryImage");
          dispatch({
            type: LIBRARY_IMAGE_FAILURE,
            payload: "Edition ID is required"
          });
          throw new Error("Edition ID is required");
        }
        
        // Get authentication token
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          dispatch({
            type: LIBRARY_IMAGE_FAILURE,
            payload: "Authentication required"
          });
          throw new Error("Authentication required");
        }
        
        // Start loading state - use LIBRARY_IMAGE_PROGRESS with 1% to indicate start
        dispatch({ 
          type: LIBRARY_IMAGE_PROGRESS,
          payload: 1 
        });
        
        let newImageUrl;
        if (image) {
          console.log(`Getting signed URL for file: ${key}`);
          const signedUrlResponse = await getSignedUrl({ key, content_type });
          
          console.log(`Uploading file to S3...`);
          const uploadResponse = await uploadFileToSignedUrl(
            signedUrlResponse.data.signedUrl,
            image,
            content_type,
            dispatch
          );
          
          newImageUrl = extractImageUrl(uploadResponse.config.url);
          console.log(`File uploaded, image URL: ${newImageUrl}`);
        } else {
          console.error("No image provided for upload");
          dispatch({
            type: LIBRARY_IMAGE_FAILURE,
            payload: "Image file is required"
          });
          throw new Error("Image file is required");
        }
        
        // Update progress to indicate backend processing
        dispatch({ 
          type: LIBRARY_IMAGE_PROGRESS,
          payload: 95 
        });
        
        // Send the image URL to the backend
        console.log(`Saving image URL to backend for edition: ${editionId}`);
        let response;
        try {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/uploadLibraryImage/${editionId}`,
            {url: newImageUrl},
            {
              headers: {
                Authorization: `Bearer ${token.replaceAll('"', "")}`,
              },
              timeout: 10000 // 10 second timeout to prevent hanging
            }
          );
        } catch (apiError) {
          console.error(`Backend API error:`, apiError);
          dispatch({
            type: LIBRARY_IMAGE_FAILURE,
            payload: apiError.message || "Failed to save image to backend"
          });
          throw apiError;
        }
        
        // Check if the request was successful
        if (!response.data.success && response.status !== 200) {
          console.error(`Backend responded with error:`, response.data);
          dispatch({
            type: LIBRARY_IMAGE_FAILURE,
            payload: response.data.message || "Failed to upload image"
          });
          throw new Error(response.data.message || "Failed to upload image");
        }
        
        console.log(`Backend response:`, response.data);
        
        const { publish } = getState();
        let newObj = {...publish.singleEdition};
        
        // Update edition object with new upload images
        newObj.uploadImages = response.data.uploadImages || [];
        
        // First update the edition
        dispatch({
          type: LIBRARY_IMAGE_SUCCESS,
          payload: {
            edition: newObj,
            libraryImages: response.data.libraryImages || []
          }
        });
        
        console.log(`Upload successful`);
        
        return response.data;
      } catch (error) {
        console.error(`Error uploading library image:`, error);
        
        // Ensure loading state is reset on any error
        dispatch({
          type: LIBRARY_IMAGE_FAILURE,
          payload: error.message || "An unknown error occurred"
        });
        
        // Re-throw the error for component-level handling
        throw error;
      }
    };
  };

export const getLibraryImagesByEditionId = (editionId) => async (dispatch) => {
  try {
    console.log(`===== REDUX: getLibraryImagesByEditionId =====`);
    console.log(`Action called with editionId: ${editionId}`);
    
    if (!editionId) {
      console.log(`REDUX: Missing editionId, aborting API call`);
      return dispatch({
        type: GET_LIBRARY_IMAGES_FAILURE,
        payload: "Edition ID is required",
      });
    }
    
    dispatch({ type: GET_LIBRARY_IMAGES_REQUEST });
    console.log(`REDUX: Dispatched GET_LIBRARY_IMAGES_REQUEST`);
    
    // Get token from localStorage
    const token = localStorage.getItem("token")?.replaceAll('"', "") || '';
    console.log(`REDUX: Token available: ${!!token}, length: ${token.length}`);
    
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getLibraryImages/${editionId}`;
    console.log(`REDUX: API URL: ${apiUrl}`);
    
    let response;
    try {
      response = await axios.get(apiUrl, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        timeout: 10000 // 10 second timeout to prevent hanging requests
      });
    } catch (apiError) {
      console.error(`REDUX: API request failed:`, apiError);
      
      // Ensure loading state is reset on API error
      dispatch({
        type: GET_LIBRARY_IMAGES_FAILURE,
        payload: apiError.message || "API request failed"
      });
      
      return;
    }
    
    console.log(`REDUX: API response status: ${response.status}`);
    
    // Process response in the correct format
    dispatch({
      type: GET_LIBRARY_IMAGES_SUCCESS,
      payload: {
        data: response.data.data || [],
        fullData: response.data.fullData || []
      },
    });
    console.log(`REDUX: Dispatched GET_LIBRARY_IMAGES_SUCCESS with data array length: ${response.data.data?.length || 0}`);
  } catch (error) {
    console.error(`REDUX: Library images fetch error: ${error.message}`);
    
    // Ensure loading state is reset on any error
    dispatch({
      type: GET_LIBRARY_IMAGES_FAILURE,
      payload: error.message || "An unknown error occurred"
    });
  }
};

export const uploadNewLibraryImage = (key, content_type, image, editionId, imageData = {}) => async (dispatch) => {
  try {
    dispatch({ type: UPLOAD_NEW_LIBRARY_IMAGE_REQUEST });
    
    // Track upload progress
    let newImageUrl;
    if (image) {
      const signedUrlResponse = await getSignedUrl({ key, content_type });

      // Upload file and track progress
      await axios.put(signedUrlResponse.data.signedUrl, image, {
        headers: { "Content-Type": content_type },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const uploadProgress = Math.round((loaded / total) * 100);
          dispatch({
            type: LIBRARY_IMAGE_PROGRESS,
            payload: uploadProgress,
          });
        },
      });

      newImageUrl = extractImageUrl(signedUrlResponse.data.signedUrl);
    }

    // Send the URL to the backend to update the edition
    const token = localStorage.getItem("token").replaceAll('"', "");
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/uploadNewLibraryImage/${editionId}`,
      { 
        url: newImageUrl,
        title: imageData.title || '',
        description: imageData.description || '',
        tags: imageData.tags || []
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update the Redux store with the updated library images
    dispatch({
      type: UPLOAD_NEW_LIBRARY_IMAGE_SUCCESS,
      payload: {
        libraryImages: response.data.libraryImages,
        fullData: response.data.fullData
      },
    });

    // Reset progress
    dispatch({
      type: LIBRARY_IMAGE_PROGRESS,
      payload: 0,
    });

    // Success notification
    toast.success("Library image uploaded successfully", {
      autoClose: 3000
    });
    
    return response.data;
  } catch (error) {
    console.error("Error uploading new library image:", error);
    
    // Error notification
    toast.error("Failed to upload image", {
      autoClose: 3000
    });
    
    dispatch({ 
      type: UPLOAD_NEW_LIBRARY_IMAGE_FAILURE, 
      payload: error.message 
    });
    throw error;
  }
};