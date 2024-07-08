import axios from "axios";
import ServerUrl from "../context/production";

const upvoteApi = async ({postId}) => {
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/upVote/${postId}`,
      null,
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

export default upvoteApi;

