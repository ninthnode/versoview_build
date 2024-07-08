import axios from "axios";
import ServerUrl from "../context/production";

export const postApi = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/createPost`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPost = async (page) => {
    try {
      const response = await axios.get(`${ServerUrl}/api/v1/post/getAllPost`,{
        params: { page, limit: 10 },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

export const unreadPostApi = async ({postId}) => {
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const response = await axios.delete(
        `${ServerUrl}/api/v1/post/deleteUnreadPost/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

export const getAllPostByChannelId = async ({channelId}) => {
    console.log(channelId, "channel in api----")
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getPostByChannelId/${channelId}`, {
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
  

export const getPostByIdApi = async ({postId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getPost/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  export const getUnreadPostApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getAllUnreadPost/${channelId}`, {
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