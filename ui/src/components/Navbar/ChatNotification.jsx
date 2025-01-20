import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Image,Box,Text } from "@chakra-ui/react";
const ChatNotification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null); // Store socket instance

  // Fetch unread messages count from the server
  // const fetchUnreadMessageCount = async (userId) => {
  //   try {
  //     const token = localStorage.getItem("token").replaceAll('"', "");

  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/unread/${userId}`,
  //       { 
  //         headers: {
  //         Authorization: `Bearer ${token}`,
  //         }
  //       }
  //     );
  //     return response.data.unreadCount;
  //   } catch (error) {
  //     console.error("Error fetching unread message count", error);
  //     return 0;
  //   }
  // };

  // useEffect(() => {
  //   // Fetch initial unread count
  //   const getUnreadCount = async () => {
  //     const count = await fetchUnreadMessageCount(userId);
  //     setUnreadCount(count);
  //   };
  //   getUnreadCount();

  //   // Initialize socket connection
  //   socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL);

  //   // Register user with the socket
  //   socketRef.current.emit("register", userId);

  //   // Listen for real-time updates
  //   socketRef.current.on("unreadCount", (count) => {
  //     console.log("Received unreadCount update:", count);
  //     setUnreadCount(count);
  //   });

  //   // Cleanup socket on component unmount
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.off("unreadCount");
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //     }
  //   };
  // }, [userId]);

  return (
    <Box pos="relative">
      {/* <span className="notification-badge">{unreadCount}</span> */}
      <Image src={"/assets/group-icon.png"} h="40px" w="40px" />
      <Box pos='absolute' top='-1px' right='0' backgroundColor='red' borderRadius='50%' h='23px' w='23px' display='flex' justifyContent='center' alignItems='center'>
      <Text size='sm' color='#fff'>{unreadCount}</Text>
      </Box>
    </Box>
  );
};

export default ChatNotification;
