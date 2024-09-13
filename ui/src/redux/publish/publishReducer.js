import {
    CREATE_EDITION_REQUEST,
    CREATE_EDITION_SUCCESS,
    GET_EDITIONS_REQUEST,
    GET_EDITIONS_SUCCESS,
    GET_SINGLE_EDITION_REQUEST,
    GET_SINGLE_EDITION_SUCCESS
  } from './publishTypes';
  
  const initialState = {
    editions: [],
    singleEdition: {},
    singleEditionPosts: [],
    loading: false,
    error: null,
    success: false,
  };
  
 const publishReducer = (state = initialState, action) => {
    switch (action.type) {
      case CREATE_EDITION_REQUEST:
      case GET_EDITIONS_REQUEST:
      case GET_SINGLE_EDITION_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case CREATE_EDITION_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
          editions: [...state.editions, action.payload],
        };
      case GET_EDITIONS_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
          editions: action.payload,
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
      default:
        return state;
    }
  };
  
  export default publishReducer;