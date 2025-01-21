import React, { useEffect, useState } from "react";
import axios from "axios";
import { Image, Box, Text } from "@chakra-ui/react";
import { initializeSocket, disconnectSocket } from "../../app/utils/socket";

const ChatNotification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadMessageCount = async () => {
    try {
      const token = localStorage.getItem("token").replaceAll('"', "");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/unread/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread message count", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchCountAndSetupSocket = async () => {
      const count = await fetchUnreadMessageCount();
      setUnreadCount(count);

      const socket = initializeSocket(userId);
      socket.on("unreadCount", (count) => {
        setUnreadCount(count);
      });
    };

    fetchCountAndSetupSocket();

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  return (
    <Box pos="relative">
      <Image src={"/assets/group-icon.png"} h="40px" w="40px" />
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
          {unreadCount}
        </Text>
      </Box>
    </Box>
  );
};

export default ChatNotification;
