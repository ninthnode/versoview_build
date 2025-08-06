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
    GET_LIBRARY_IMAGES_REQUEST,
    GET_LIBRARY_IMAGES_SUCCESS,
    UPLOAD_LIBRARY_IMAGE_REQUEST,
    UPLOAD_LIBRARY_IMAGE_SUCCESS,
    GET_LIBRARY_IMAGES_FAILURE,
    UPLOAD_LIBRARY_IMAGE_FAILURE,
    ADD_TEMP_LIBRARY_IMAGE,
    CLEAR_TEMP_LIBRARY_IMAGES
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
    libraryImages: [],
    libraryLoading: false,
    libraryError: null,
    libraryUploadLoading: false,
    libraryUploadError: null,
    tempLibraryImages: [],
  };
  
 const publishReducer = (state = initialState, action) => {
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
      case GET_LIBRARY_IMAGES_REQUEST:
        return {
          ...state,
          libraryLoading: true,
          libraryError: null,
        };
      case UPLOAD_PDF_PROGRESS:
        return {
          ...state,
          uploadSteps: 1,
          uploadProgress: action.payload,
        };
      case GET_LIBRARY_IMAGES_SUCCESS:
        return {
          ...state,
          libraryLoading: false,
          libraryImages: action.payload,
          libraryError: null,
        };
      case GET_LIBRARY_IMAGES_FAILURE:
        return {
          ...state,
          libraryLoading: false,
          libraryError: action.payload,
        };
      case UPLOAD_LIBRARY_IMAGE_REQUEST:
        return {
          ...state,
          libraryUploadLoading: true,
          libraryUploadError: null,
        };
      case UPLOAD_LIBRARY_IMAGE_SUCCESS:
        return {
          ...state,
          libraryUploadLoading: false,
          libraryImages: action.payload,
          libraryUploadError: null,
        };
      case UPLOAD_LIBRARY_IMAGE_FAILURE:
        return {
          ...state,
          libraryUploadLoading: false,
          libraryUploadError: action.payload,
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
          libraryLoading: false,
          libraryError: null,
          libraryUploadLoading: false,
          libraryUploadError: null,
        };
      case GET_USER_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          userEditions: action.payload,
        };
      case ADD_TEMP_LIBRARY_IMAGE:
        console.log('Redux: Adding temp library image', action.payload);
        console.log('Redux: Current tempLibraryImages count:', state.tempLibraryImages.length);
        const newTempImages = [...state.tempLibraryImages, action.payload];
        console.log('Redux: New tempLibraryImages count:', newTempImages.length);
        return {
          ...state,
          tempLibraryImages: newTempImages,
        };
      case CLEAR_TEMP_LIBRARY_IMAGES:
        return {
          ...state,
          tempLibraryImages: [],
        };
      default:
        return state;
    }
  };
  
  export default publishReducer;