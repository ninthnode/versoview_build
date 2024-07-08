import axios from "axios";
import ServerUrl from "../context/production";

const checkOwnerApi = async ({postId}) => {
  console.log(postId, "postId----in api")
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${ServerUrl}/api/v1/post/postOwner/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response, "response of owner api---")
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export default checkOwnerApi;
