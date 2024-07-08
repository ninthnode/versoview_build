import axios from "axios";
import ServerUrl from "../context/production";

const chooseTopicsApi = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${ServerUrl}/api/v1/genre/getAllGenre`, {
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

export default chooseTopicsApi;
