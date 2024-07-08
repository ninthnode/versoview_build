import axios from "axios";
import ServerUrl from "../context/production";

export const loginApi = async (formData) => {
  try {
    const response = await axios.post(
      `${ServerUrl}/api/v1/users/login`,
      formData
    );
  
    return response.data; 
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const signUpApi = async (formData) => {
    try {
      const response = await axios.post(
        `${ServerUrl}/api/v1/users/signUp`,
        formData
      );
  
      return response.data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

export const getProfileApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/channel/getChannel/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };
  
  export const getUserByIdApi = async ({username}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/users/getUser/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };
  
 export const updateProfileApi = async ({ formData, channelId, profileUrl, backgroundColor}) => {
    try {
      const token = localStorage.getItem("token");
      const requestData = new FormData(); 
      if (profileUrl) {
        requestData.append("channelIconImageUrl", profileUrl);
      } 
  
      if (backgroundColor) {
        requestData.append("backgroundColor", backgroundColor);
      } 
  
      if (formData) {
        for (let key in formData) {
          requestData.append(key, formData[key]);
        }
      }
  
      const response = await axios.put(
        `${ServerUrl}/api/v1/channel/updateChannel/${channelId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating channel:', error.message);
    }
  };
  export const updateUserApi = async ({ profileUrl, userId, selectedChoices}) => {
    try {
      const token = localStorage.getItem("token");
  
      const formData = {};
      if(profileUrl){
        formData.profileImageUrl =  profileUrl;
      }
  
      if(selectedChoices){
        formData.genre = selectedChoices;
      }
     
      const response = await axios.put(
        `${ServerUrl}/api/v1/users/updateUser/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ContentType: 'application/json',
          },
        }
      );
      console.log(response.data, "user update response---")
      return response.data;
    } catch (error) {
      console.error('Error updating channel:', error.message);
    }
  };

  export const getChannelByName = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/channel/getChannelByName`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log(response.data)
      return response.data.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };
  