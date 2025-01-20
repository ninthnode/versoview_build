import { SET_TITLE,CLEAR_TITLE } from './types';
const initialTitleState = {
  title: '',
  icon:''
};

const titleReducer = (state = initialTitleState, action) => {
  switch (action.type) {
    case SET_TITLE:
      return {
        title: action.payload.title,
        icon: action.payload.icon,
      };
    case CLEAR_TITLE:
      return {
        title: '',
        icon:''
      };
    default:
      return state;
  }
};


  
  export default titleReducer;
