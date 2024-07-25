import { GET_PROFILE, SAVE_PROFILE } from "./types";
import get from "@/app/utils/get";

const getProfile = (profile) => ({
  type: GET_PROFILE,
  payload: profile,
});

const saveProfile = (newProfile) => ({
  type: SAVE_PROFILE,
  payload: newProfile,
});

export const fetchProfile =
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
    return dispatch(getProfile(user));
  };

export const updateProfile =
  (newProfile, setIsEditing, setUpdating) => async (dispatch, getState) => {
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
      body: newProfile,
    })
      .then((r) => {
        setIsEditing(false);
        return r.user;
      })

      .finally(() => setUpdating(false));
    return dispatch(saveProfile(newUser));
  };
