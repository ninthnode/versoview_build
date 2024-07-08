import axios from "axios";
import ServerUrl from "../context/production";

const getAllBookmarkApi = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${ServerUrl}/api/v1/post/getBookmark`, {
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

export default getAllBookmarkApi;
