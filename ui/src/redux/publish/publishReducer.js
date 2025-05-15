import { steps } from 'framer-motion';
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
    LIBRARY_IMAGE_FAILURE,
    GET_LIBRARY_IMAGES_REQUEST,
    GET_LIBRARY_IMAGES_SUCCESS,
    GET_LIBRARY_IMAGES_FAILURE,
    UPLOAD_NEW_LIBRARY_IMAGE_REQUEST,
    UPLOAD_NEW_LIBRARY_IMAGE_SUCCESS,
    UPLOAD_NEW_LIBRARY_IMAGE_FAILURE
  } from './publishTypes';
  
  const initialState = {
    editions: [],
    singleEdition: {},
    singleEditionPosts: [],
    loading: false,
    error: null,
    success: false,
    userEditions: {},
    uploadProgress:0,
    uploadSteps:0,
    libraryImageProgress:0,
    libraryImages: [],
    fullLibraryImages: [],
    libraryImagesLoading: false,
    libraryImagesError: null,
    uploadingLibraryImage: false
  };
  
 const publishReducer = (state = initialState, action) => {
    console.log(`REDUCER: Action type received: ${action.type}`);
    switch (action.type) {
      case CREATE_EDITION_REQUEST:
      case GET_EDITIONS_REQUEST:
      case GET_SINGLE_EDITION_REQUEST:
      case GET_USER_EDITION_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case UPLOAD_NEW_LIBRARY_IMAGE_REQUEST:
        return {
          ...state,
          uploadingLibraryImage: true,
          error: null,
        };
      case GET_LIBRARY_IMAGES_REQUEST:
        console.log(`REDUCER: GET_LIBRARY_IMAGES_REQUEST - Setting loading to true`);
        return {
          ...state,
          libraryImagesLoading: true,
          libraryImagesError: null,
        };
      case UPLOAD_PDF_PROGRESS:
        return {
          ...state,
          uploadSteps: 1,
          uploadProgress: action.payload,
        };
      case LIBRARY_IMAGE_PROGRESS:
        return {
          ...state,
          libraryImageProgress: action.payload,
        }
      case LIBRARY_IMAGE_SUCCESS:
        console.log(`REDUCER: LIBRARY_IMAGE_SUCCESS`);
        console.log(`Updated payload:`, action.payload);
        
        // Get edition and library images from payload
        const edition = action.payload.edition || action.payload;
        const newLibraryImages = action.payload.libraryImages || [];
        
        console.log(`Edition:`, edition);
        console.log(`New library images count:`, newLibraryImages.length);
        
        return {
          ...state,
          libraryImageProgress: 0,
          libraryImagesLoading: false,
          uploadingLibraryImage: false,
          singleEdition: edition,
          // Update libraryImages array with the new images if they're provided
          libraryImages: newLibraryImages.length > 0 
            ? newLibraryImages 
            : [
                ...(edition.uploadImages || []),
                ...(state.libraryImages || []).filter(img => 
                  !(edition.uploadImages || []).includes(img)
                )
              ]
        };
      case UPLOAD_NEW_LIBRARY_IMAGE_SUCCESS:
        console.log(`REDUCER: UPLOAD_NEW_LIBRARY_IMAGE_SUCCESS`);
        return {
          ...state,
          uploadingLibraryImage: false,
          libraryImagesLoading: false,
          libraryImageProgress: 0,
          libraryImages: action.payload.libraryImages,
          fullLibraryImages: action.payload.fullData || [],
        };
      case UPLOAD_NEW_LIBRARY_IMAGE_FAILURE:
        return {
          ...state,
          uploadingLibraryImage: false,
          error: action.payload,
        };
      case GET_LIBRARY_IMAGES_SUCCESS:
        console.log(`REDUCER: GET_LIBRARY_IMAGES_SUCCESS - Received data`);
        console.log(`REDUCER: Library images count: ${(action.payload.data || []).length}`);
        console.log(`REDUCER: Full library images count: ${(action.payload.fullData || []).length}`);
        return {
          ...state,
          libraryImages: action.payload.data || [],
          fullLibraryImages: action.payload.fullData || [],
          libraryImagesLoading: false,
          libraryImagesError: null,
        };
      case GET_LIBRARY_IMAGES_FAILURE:
        console.log(`REDUCER: GET_LIBRARY_IMAGES_FAILURE - Error: ${action.payload}`);
        return {
          ...state,
          libraryImagesLoading: false,
          libraryImagesError: action.payload,
        };
      case CREATE_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
          editions: [...state.editions, action.payload],
          uploadSteps: 0,
          uploadProgress: 0,
        };
      case GET_EDITIONS_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
          editions: action.payload,
        };
      case GET_SINGLE_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
          singleEdition: action.payload.editionData,
          singleEditionPosts: action.payload.postData,
        };
      case CLEAN_EDITION:
        return {
          ...state,
          loading: true,
          success: false,
          singleEdition: {},
          singleEditionPosts: [],
          libraryImages: [],
        };
      case GET_USER_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          userEditions: action.payload,
        };
      case LIBRARY_IMAGE_FAILURE:
        console.log(`REDUCER: LIBRARY_IMAGE_FAILURE - ${action.payload}`);
        return {
          ...state,
          libraryImageProgress: 0,
          error: action.payload
        };
      default:
        return state;
    }
  };
  
  export default publishReducer;