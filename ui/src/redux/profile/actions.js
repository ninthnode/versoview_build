import axios from 'axios';
import {
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
  USER_FETCH_FAILURE,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
} from "./types";

const fetchUser = (id) => async (dispatch) => {
  dispatch({ type: USER_FETCH_REQUEST });
  try {
    console.log(id)
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getUser/${id}`, {
      headers: {
        authorization: `Bearer ${localStorage
        .getItem("token")
        .replaceAll('"', "")}`,
      },
    })
    dispatch({ type: USER_FETCH_SUCCESS, payload: response.data.user });
  } catch (error) {
    dispatch({ type: USER_FETCH_FAILURE, payload: error.message });
  }
};

const updateUser = (id, data) => async (dispatch) => {
  dispatch({ type: USER_UPDATE_REQUEST });
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/updateUser/${id}`, data, {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
      },
    });
    dispatch({ type: USER_UPDATE_SUCCESS, payload: response.data.user });
  } catch (error) {
    dispatch({ type: USER_UPDATE_FAILURE, payload: error.message });
  }
};

export { fetchUser, updateUser };
