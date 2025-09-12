import React, { useEffect, useState } from "react";
import axios from "axios";
import { Image, Box, Text } from "@chakra-ui/react";
import { initializeSocket, disconnectSocket } from "../../app/utils/socket";
import { listenToNotificationUpdates } from "../../app/utils/notificationEvents";

const ChatNotification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

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

  // Fetch count on mount and setup socket
  useEffect(() => {
    if (!userId) return;

    const fetchCountAndSetupSocket = async () => {
      const count = await fetchUnreadMessageCount();
      console.log("ChatNotification: Initial count fetched:", count);
      setUnreadCount(count);

      const socket = initializeSocket(userId);
      
      const handleUnreadCountUpdate = (count) => {
        console.log("ChatNotification: Received unreadCount update:", count);
        setUnreadCount(count || 0);
        setLastUpdated(Date.now());
      };

      const handleNewMessage = async () => {
        console.log("ChatNotification: Received new DM, fetching updated count");
        const count = await fetchUnreadMessageCount();
        console.log("ChatNotification: Updated count after new DM:", count);
        setUnreadCount(count);
        setLastUpdated(Date.now());
      };

      // Remove any existing listeners for this component
      socket.off("unreadCount", handleUnreadCountUpdate);
      socket.off("dm", handleNewMessage);
      
      // Add new listeners
      socket.on("unreadCount", handleUnreadCountUpdate);
      socket.on("dm", handleNewMessage);

      // Cleanup function
      return () => {
        socket.off("unreadCount", handleUnreadCountUpdate);
        socket.off("dm", handleNewMessage);
      };
    };

    const cleanup = fetchCountAndSetupSocket();
    return cleanup;
  }, [userId]);

  // Listen to custom window events for notification updates
  useEffect(() => {
    const cleanup = listenToNotificationUpdates((count) => {
      console.log("ChatNotification: Received custom event update:", count);
      setUnreadCount(count);
    });

    return cleanup;
  }, []);

  // Backup polling mechanism - fetch count every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      const count = await fetchUnreadMessageCount();
      if (count !== unreadCount) {
        console.log("ChatNotification: Polling detected count change:", count);
        setUnreadCount(count);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, unreadCount]);

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