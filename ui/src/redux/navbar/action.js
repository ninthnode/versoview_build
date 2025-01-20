import { SET_TITLE,CLEAR_TITLE } from "./types";
export const clearTitle = () => ({ type: CLEAR_TITLE });

export const setNavTitle = (title, icon) => {
  return async (dispatch) => {
    const data = {
      title: title,
      icon: icon,
    };
    dispatch({
      type: SET_TITLE,
      payload: data,
    });
  };
};
