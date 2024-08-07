import { SET_TITLE } from "./types";
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
