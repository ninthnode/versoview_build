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
    UPLOAD_IMAGES_PROGRESS,
    CLEAN_EDITION
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
    uploadSteps:0
  };
  
 const publishReducer = (state = initialState, action) => {
    switch (action.type) {
      case CREATE_EDITION_REQUEST:
      case GET_EDITIONS_REQUEST:
      case GET_SINGLE_EDITION_REQUEST:
      case  GET_USER_EDITION_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case UPLOAD_PDF_PROGRESS:
        return {
          ...state,
          uploadSteps: 1,
          uploadProgress: action.payload,
        };
      case UPLOAD_IMAGES_PROGRESS:
        return {
          ...state,
          uploadSteps: 2,
          uploadProgress: state.uploadProgress + action.payload,
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
        };
      case GET_USER_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          userEditions: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default publishReducer;