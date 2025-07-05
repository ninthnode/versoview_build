import React, { useEffect, useState } from "react";
import axios from "axios";
import { Image, Box, Text } from "@chakra-ui/react";
import { initializeSocket, disconnectSocket } from "../../app/utils/socket";

const ChatNotification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadMessageCount = async () => {
    try {
      const token = localStorage.getItem("token")?.replaceAll('"', "");
      if (!token) return 0;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/unread/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error("Error fetching unread message count", error);
      return 0;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchCountAndSetupSocket = async () => {
      const count = await fetchUnreadMessageCount();
      setUnreadCount(count);

      const socket = initializeSocket(userId);
      
      socket.on("unreadCount", (count) => {
        setUnreadCount(count || 0);
      });

      // Listen for new messages to update count
      socket.on("dm", () => {
        fetchUnreadMessageCount().then(setUnreadCount);
      });
    };

    fetchCountAndSetupSocket();

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  return (
    <Box pos="relative">
      <Image src={"/assets/group-icon.png"} h="30px" w="34px" style={{ marginRight: "10px", padding: "2px", borderRadius: "20%", border: "2px solid #333"}} />
      {/* Only show notification badge when there are unread messages */}
      {unreadCount > 0 && (
        <Box
          pos="absolute"
          top="-1px"
          right="0"
          backgroundColor="red"
          borderRadius="50%"
          h="23px"
          w="23px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text size="sm" color="#fff">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ChatNotification;