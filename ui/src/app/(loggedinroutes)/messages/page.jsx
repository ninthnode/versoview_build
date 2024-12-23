"use client";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Input,
  Button,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { formatDateTime } from "@/app/utils/DateUtils";
const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
import { useRef } from "react";
import axios from 'axios';
import useDeviceType from "@/components/useDeviceType";

const Dms = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const authState = useSelector((state) => state.auth.user?.user);
  const [allUsers, setAllUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const deviceType = useDeviceType();

  useEffect(() => {
    if (authState) {
      socket.emit("register", authState.id);
    }

    socket.on("dm", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), message: data.message, senderId: data.sender },
      ]);
    });

    return () => {
      socket.off("dm");
    };
  }, [authState]);

  useEffect(() => {
    const token = localStorage.getItem("token").replaceAll('"', "");
    async function fetchUsers() {
      try {
        if (search === "") {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/recent-chats/${authState.id}/`, { 
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          console.log(response.data.data)
          setAllUsers(response.data.data);
          setSearching(true);
        }else{
          
        const response = await
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getChatUsers/${search}`, { 
          headers: {
          Authorization: `Bearer ${token}`,
          }
        });
        const data = response.data
        // setSearching(true);
        setAllUsers(data);
        
      }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    if (token) fetchUsers();
  }, [search]);

  useEffect(() => {
    async function fetchMessages() {
      if (authState && selectedUser) {
        try {
          const token = localStorage.getItem("token").replaceAll('"', "");

          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/chat/${authState.id}/${selectedUser._id}`, { 
            headers: {
            Authorization: `Bearer ${token}`,
            }
          });

          if (response.status === 200) {
            const data = await response.data
            setMessages(data);
          } else {
            console.error("Failed to fetch previous messages");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
    fetchMessages();
  }, [authState, selectedUser]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("private_message", {
        senderId: authState.id,
        receiverId: selectedUser._id,
        message: newMessage,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), message: newMessage, senderId: authState.id },
      ]);
      setNewMessage("");
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <HStack spacing={0} overflow="hidden" alignItems="flex-start" maxH="90vh">
                       {deviceType != "phone" && (
                        <Box
        width="30%"
        borderRight="1px solid"
        borderColor="gray.200"
        overflowY="auto"
        bg="gray.50"
      >
        <Box position="relative" mt={1} rounded="md" shadow="sm">
          <Input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            pr="30%"
            bg="gray.100"
            rounded="md"
            borderColor="gray.300"
            focusBorderColor="indigo.500"
          />
        </Box>
        <VStack spacing={4} p={4}>
          {!searching ? (
            <Text textAlign="center" mt="1">
              Start typing to search...
            </Text>
          ) : allUsers.length > 0 ? (
            allUsers.map((user) => (
              <HStack
                key={user._id}
                spacing={4}
                p={3}
                cursor="pointer"
                bg={selectedUser?._id === user._id ? "gray.100" : "transparent"}
                onClick={() => setSelectedUser(user)}
                borderRadius="md"
                _hover={{ bg: "gray.100" }}
                w="100%"
              >
                <Avatar name={user.username} src={user.channelIconImageUrl} />
                <Text fontWeight="bold">{user.username}</Text>
              </HStack>
            ))
          ) : (
            <Text textAlign="center" mt="1">
              No users found
            </Text>
          )}
        </VStack>
      </Box>)}

      {/* Chat Section */}
      <Box
        width="70%"
        height="90vh"
        display="flex"
        flexDirection="column"
        px={4}
        border="1px solid #e5e5e5"
        borderRadius="md"
      >
        {selectedUser ? (
          <>
          <Flex mt='2' alignItems="center" mb={4} bg={"gray.100"} rounded="sm" p={2}>
          <Avatar name={selectedUser.username} src={selectedUser.channelIconImageUrl} />
          <Text ml={2} fontWeight="bold">{selectedUser.username}</Text>
          </Flex>
            <Box flex="1" overflowY="auto">
              <VStack spacing={4}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    alignSelf={
                      msg.senderId === authState.id ? "flex-end" : "flex-start"
                    }
                    maxWidth="70%"
                    mr={msg.senderId === authState.id ? 2 : 0}
                  >
                    <Box
                      bg={
                        msg.senderId === authState.id ? "blue.500" : "gray.200"
                      }
                      color={msg.senderId === authState.id ? "white" : "black"}
                      borderRadius="lg"
                      p={3}
                    >
                      <Text>{msg.message}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {formatDateTime(msg.timestamp)}
                    </Text>
                  </Box>
                ))}
                {/* Ref to scroll to the bottom */}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>
            <Divider my={4} />
            <HStack>
              <Input
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button colorScheme="blue" onClick={handleSendMessage}>
                Send
              </Button>
            </HStack>
          </>
        ) : (
          <Text textAlign="center" mt="20">
            Select a user to start chatting
          </Text>
        )}
      </Box>
    </HStack>
  );
};

export default Dms;
