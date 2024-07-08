import axios from "axios";
import ServerUrl from "../context/production";

export const getAllChannelApi = async () => {
  try {
    const response = await axios.get(`${ServerUrl}/api/v1/channel/getAllChannel`);
    return response.data.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const followChannelApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const status = "unfollow";
      const response = await axios.post(
        `${ServerUrl}/api/v1/channel/followChannel/${channelId}`, { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     
      console.log(response.data, "response follow ----")
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  export const followChannelList = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/channel/followChannelList`, {
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

  export const FollowersList = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/channel/followersList/${channelId}`, {
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

  export const GetFollowChannelApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/channel/getFollowChannel/${channelId}`, {
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

  export const pinnedChannelApi = async ({channelId}) => {
    console.log(channelId, "channel Id in api...")
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      `${ServerUrl}/api/v1/channel/pinnedChannel/${channelId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating channel:', error.message);
  }
};
export const unfollowChannelApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const response = await axios.delete(
        `${ServerUrl}/api/v1/channel/unfollowChannel/${channelId}`,
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
  
  export const unpinnedChannelApi = async ({channelId}) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.put(
        `${ServerUrl}/api/v1/channel/unpinnedChannel/${channelId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data, "api response---")
      return response.data;
    } catch (error) {
      console.error('Error updating channel:', error.message);
    }
  };
  