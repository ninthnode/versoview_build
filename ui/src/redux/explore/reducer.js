import {
  GET_PROFILE,
  SAVE_PROFILE
} from "./types";


const profileReducer = (state = {}, action = { type: null }) => {
  switch (action.type) {
    case GET_PROFILE:
      return {
        ...state,
        ...action.payload,
      };
    case SAVE_PROFILE:
      return {
        ...state,
        ...action.payload  
      };
   
    default:
      return state;
  }
};

export default profileReducer;
