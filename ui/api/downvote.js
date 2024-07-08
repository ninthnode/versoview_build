import axios from "axios";
import ServerUrl from "../context/production";

const downvoteApi = async ({postId}) => {
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.put(
      `${ServerUrl}/api/v1/post/downVote/${postId}`,
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

export default downvoteApi;

