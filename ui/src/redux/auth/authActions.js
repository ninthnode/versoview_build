import axios from "axios";
import {
  LOGIN_SUCCESS,
  SIGNUP_SUCCESS,
  LOGOUT_SUCCESS,
  LOADING_START,
} from "./types";

const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user,
});
const signupsuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: user,
});

export const loginUser = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: LOADING_START,
    });
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/login`,
      formData
    );
    if (+response.status === 200 || +response.status === 201) {
      dispatch(loginSuccess(response));
      localStorage.setItem("token", JSON.stringify(response.data.data.token));
      window.location.href = "/home";
    } else {
      console.log("Login failed:", response.statusText);
    }
  } catch (error) {
    console.log("Error during login:", error);
  }
};

export const signupUser = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: LOADING_START,
    });
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/signUp`,
      formData
    );
    if (response.status == 200 || response.status == 201) {
      dispatch(signupsuccess(response));
      localStorage.setItem("token", JSON.stringify(response.data.data.token));
      window.location.href = "/choose-topics";
    }
  } catch (error) {
    console.log(error);
  }
};

export const verifyUser = () => async (dispatch) => {
  try {
    let token = localStorage.getItem("token");
    token = token ? token.replace(/^"(.*)"$/, "$1") : null;

    if (!token) throw new Error("No access token available");

    const config = {
      headers: { Authorization: `${token}` },
    };
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/verify-user`,
      config
    );
    if (+response.status === 200 || +response.status === 201) {
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("userEmail", response.data.user.email);

      dispatch(loginSuccess(response));
      return response.data;
    }
    throw new Error("User verification failed");
  } catch (error) {
    console.error("Error verifying user:", error);
  }
};

export const loginOut = () => async (dispatch) => {
  try {
    dispatch({
      type: LOGOUT_SUCCESS,
    });
    localStorage.setItem("userToken", "");
    localStorage.setItem("refreshToken", "");
    window.location.href = "/login";
  } catch (error) {
    console.log("Error during Logout:", error);
  }
};
export const editUserProfile = (newProfile) => async (dispatch) => {
  try {
    let token = localStorage.getItem("userToken");
    token = token.replace(/^"(.*)"$/, "$1");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const userData = new FormData();
    userData.append("first_name", newProfile.first_name);
    userData.append("last_name", newProfile.last_name);
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`,
      newProfile,
      config
    );
    if (+response.status === 200 || +response.status === 201) {
      dispatch(verifyUser());
    }
  } catch (error) {
    console.log("Error:", error);
  }
};
export const ForgotPasswordRequest = (email) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password?email=${email}`
    );
    if (+response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log("Error:", error);
  }
};
export const ResetPasswordRequest =
  (password, passkey, hashkey) => async (dispatch) => {
    try {
      const userdata = new FormData();
      userdata.append("passkey", passkey);
      userdata.append("hashkey", hashkey);
      userdata.append("password", password);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`,
        userdata
      );
      if (+response.status === 200 || +response.status === 201) {
        console.log(response.data);
        return response.data;
      }
    } catch (error) {
      console.log("Error:", error);
      return error.response.data;
    }
  };
export const ChangePasswordRequest = (password) => async (dispatch) => {
  try {
    let token = localStorage.getItem("userToken");
    token = token.replace(/^"(.*)"$/, "$1");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const userdata = new FormData();
    userdata.append("password", password);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/reset-password`,
      userdata,
      config
    );
    if (+response.status === 200 || +response.status === 201) {
      console.log(response.data);
      return response.data;
    }
  } catch (error) {
    console.log("Error:", error);
    return error.response.data;
  }
};

export const googleLogin = (credential) => async (dispatch) => {
  try {
    dispatch({
      type: LOADING_START,
    });
    const userData = new FormData();
    userData.append("access_token", credential);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
      userData
    );
    if (+response.status === 200 || +response.status === 201) {
      console.log("ss");
      dispatch(loginSuccess(response));
      localStorage.setItem("userToken", JSON.stringify(response.data.access));
      localStorage.setItem(
        "refreshToken",
        JSON.stringify(response.data.refresh)
      );
      window.location.href = "/dashboard";
    } else {
      console.log("Login failed:", response.statusText);
    }
  } catch (error) {
    console.log("Error during login:", error);
  }
};
