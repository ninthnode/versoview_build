import axios from "axios";
import ServerUrl from "../context/production";

const bookmarkApi = async (type, postId) => {
  console.log(type, "is type there")
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/addBookmark/${postId}?type=${type}`,
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

export default bookmarkApi;
