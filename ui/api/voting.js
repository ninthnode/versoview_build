import axios from "axios";
import ServerUrl from "../context/production";

const votingApi = async ({ postId }) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${ServerUrl}/api/v1/post/voting/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching voting data:", error);
        throw error;
    }
};

export default votingApi;
