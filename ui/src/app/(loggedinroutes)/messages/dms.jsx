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
  Spinner
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatDateTime } from "@/app/utils/DateUtils";
import { useRef } from "react";
import axios from "axios";
import useDeviceType from "@/components/useDeviceType";
import { useRouter } from "next/navigation";
import { initializeSocket, disconnectSocket } from "../../utils/socket";
import { useSearchParams } from "next/navigation";

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
  const [showChats, setShowChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingChats, setChatsLoading] = useState(true);
  const searchParams = useSearchParams();

  const paramsUserId = searchParams.get("id");

  const router = useRouter();

  useEffect(() => {
    if (authState && selectedUser) {
      const socket = initializeSocket(authState.id);

      socket.on("dm", (data) => {
        if (selectedUser && data.senderId === selectedUser._id)
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), message: data.message, senderId: data.sender },
          ]);
      });

      socket.on("recentChats", setAllUsers);

      return () => {
        disconnectSocket();
      };
    }
  }, [authState, selectedUser]);

  useEffect(() => {
    const token = localStorage.getItem("token").replaceAll('"', "");
    async function fetchUsers() {
      try {
        if (search === "") {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/recent-chats/${authState.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          setAllUsers(response.data.data);
          setTimeout(() => {
            setLoading(false);
          },1200)
          if (!selectedUser && paramsUserId) {
            const foundUser = response.data.data.find(
              (user) => user._id === paramsUserId
            );
            setSelectedUser(foundUser);
            if (!foundUser) {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getUser/${paramsUserId}`,
                {
                  headers: {
                    authorization: `Bearer ${localStorage
                      .getItem("token")
                      .replaceAll('"', "")}`,
                  },
                }
              );
              setSelectedUser(response.data.user);
            }
          }
          setSearching(true);
        } else {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getChatUsers/${search}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data;
          setAllUsers(data);
          setLoading(false);
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
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/chat/${authState.id}/${selectedUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200) {
            setMessages(response.data);
            deviceType === "phone" && setShowChats(true);
            setTimeout(() => {
              setChatsLoading(false);
            }, 1200);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
    if (!messages.length || messages[0]?.senderId !== selectedUser?._id) {
      fetchMessages();
    }
  }, [selectedUser]);
  

  const handleClick = (user) => {
    if (selectedUser?._id !== user._id) {
      user.unreadCount = 0;
      setSelectedUser(user);
      setSearch("");
  
      const params = new URLSearchParams(window.location.search);
      params.set("id", user._id);
  
      // Update URL without triggering a re-render
      window.history.replaceState(null, "", `/messages?${params.toString()}`);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && authState && selectedUser) {
      const socket = initializeSocket(authState.id);
      socket.emit("private_message", {
        senderId: authState.id,
        receiverId: selectedUser._id,
        message: newMessage,
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), message: newMessage, senderId: authState.id },
      ]);
      setNewMessage("");
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);
  return (
    <>
      {showChats && (
        <Button
          bg="secondary"
          w="fit-content"
          p="2"
          m="2"
          borderRadius="5"
          onClick={() => {
            setSelectedUser(null);
            setShowChats(false);    setLoading(false);
          }}
        >
          All Users
        </Button>
      )}
      <HStack spacing={0} overflow="hidden" alignItems="flex-start">
   {loading &&
    <Box width={deviceType != "phone" ? "30%" : "100%"}> <Spinner mt='4' size='md'/></Box>}
        {!loading && !showChats && (
          <Box
            width={deviceType != "phone" ? "30%" : "100%"}
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
                pr="2"
                bg="gray.100"
                rounded="md"
                borderColor="gray.300"
                focusBorderColor="indigo.500"
              />
            </Box>
            <VStack spacing={4} pt="2">
       
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
                    bg={
                      selectedUser?._id === user._id
                        ? "gray.100"
                        : "transparent"
                    }
                    onClick={() => handleClick(user)}
                    borderRadius="md"
                    _hover={{ bg: "gray.100" }}
                    w="100%"
                  >
                    <Avatar
                      name={user.username}
                      src={user.profileImageUrl}
                    />
                    <Text fontWeight="bold">
                      {user.username}{" "}
                      {user?.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "red",
                            padding: "0 5px",
                            borderRadius: "50%",
                            color: "#fff",
                          }}
                        >
                          {user.unreadCount}
                        </span>
                      )}
                    </Text>
                  </HStack>
                ))
              ) : (
                <Text textAlign="center" mt="1">
                  No users found
                </Text>
              )}
            </VStack>
          </Box>
        )}
        {/* Chat Section */}
        {(showChats || deviceType != "phone") && (
          <Box
            width={deviceType != "phone" ? "70%" : "100%"}
            height="80vh"
            display="flex"
            flexDirection="column"
            px={4}
            border="1px solid #e5e5e5"
            borderRadius="md"
          >
            
            <Box height="80vh" display="flex" flexDirection="column">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <Flex
                    mt="2"
                    alignItems="center"
                    bg="gray.100"
                    rounded="md"
                    p={3}
                  >
                    <Avatar
                      name={selectedUser.username}
                      src={selectedUser.profileImageUrl}
                    />
                    <Text ml={2} fontWeight="bold">
                      {selectedUser.username}
                    </Text>
                  </Flex>

                  {/* Chat Messages Box */}
                  <Box flex="1" overflowY="auto" maxHeight="70vh" p={3}>
                    <VStack spacing={4} align="stretch">
                      {messages.map((msg) => (
                        <Box
                          key={msg.id}
                          alignSelf={
                            msg.senderId === authState.id
                              ? "flex-end"
                              : "flex-start"
                          }
                          maxWidth="70%"
                          mr={msg.senderId === authState.id ? 2 : 0}
                        >
                          <Box
                            bg={
                              msg.senderId === authState.id
                                ? "blue.500"
                                : "gray.200"
                            }
                            color={
                              msg.senderId === authState.id ? "white" : "black"
                            }
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
                    </VStack>
                    {/* Scroll to Bottom Ref */}
                    <div ref={messagesEndRef} />
                  </Box>

                  <Divider my={4} />

                  {/* Chat Input Field */}
                  <HStack p={3}>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button colorScheme="blue" onClick={handleSendMessage}>
                      Send
                    </Button>
                  </HStack>
                </>
              ) : loadingChats ? (
                <Box width={deviceType != "phone" ? "30%" : "100%"}>
                  <Spinner mt="4" size="md" />
                </Box>
              ) : (
                <Text textAlign="center" mt="20">
                  Select a user to start chatting
                </Text>
              )}
            </Box>
          </Box>
        )}
      </HStack>
    </>
  );
};

export default Dms;
