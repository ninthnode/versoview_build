import { GET_PROFILE, SAVE_PROFILE } from "./types";
import get from "@/app/utils/get";

const getSearch = (profile) => ({
  type: GET_PROFILE,
  payload: profile,
});

const saveSearch = (newSearch) => ({
  type: SAVE_PROFILE,
  payload: newSearch,
});

export const fetchSearch =
  (isEditing, setBG) => async (dispatch, getState) => {
    const {
      auth: {
        user: {
          user: { id },
        },
      },
    } = getState();
    const user = await get(`users/getUser/${id}`).then((r) => r.user);
    !isEditing && setBG(user.profileBgColor);
    return dispatch(getSearch(user));
  };

export const updateSearch =
  (newSearch, setIsEditing, setUpdating) => async (dispatch, getState) => {
    const {
      auth: {
        user: {
          user: { id },
        },
      },
    } = getState();
    setUpdating(true);
    const newUser = await get(`users/updateUser/${id}`, {
      method: "PUT",
      body: newSearch,
    })
      .then((r) => {
        setIsEditing(false);
        return r.user;
      })

      .finally(() => setUpdating(false));
    return dispatch(saveSearch(newUser));
  };
