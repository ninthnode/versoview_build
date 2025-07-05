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
  const deviceType = useDeviceType();
  const [showChats, setShowChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const searchParams = useSearchParams();
  const socketRef = useRef(null);

  const paramsUserId = searchParams.get("id");
  const router = useRouter();

  // Initialize socket once
  useEffect(() => {
    if (authState?.id) {
      socketRef.current = initializeSocket(authState.id);
      
      socketRef.current.on("dm", (data) => {
        if (selectedUser && data.senderId === selectedUser._id) {
          setMessages((prev) => [
            ...prev,
            { 
              id: Date.now(), 
              message: data.message, 
              senderId: data.senderId,
              timestamp: data.timestamp || new Date().toISOString()
            },
          ]);
        }
      });

      socketRef.current.on("recentChats", (chats) => {
        setAllUsers(chats || []);
      });

      return () => {
        disconnectSocket();
        socketRef.current = null;
      };
    }
  }, [authState?.id, selectedUser]);

  // Fetch users (recent chats or search results)
  useEffect(() => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    if (!token || !authState?.id) return;

    async function fetchUsers() {
      try {
        setLoading(true);
        let response;
        
        if (search.trim() === "") {
          // Fetch recent chats
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/recent-chats/${authState.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          setAllUsers(response.data.data || []);
          
          // Handle URL parameter for initial user selection
          if (!selectedUser && paramsUserId) {
            const foundUser = response.data.data?.find(
              (user) => user._id === paramsUserId
            );
            
            if (foundUser) {
              setSelectedUser(foundUser);
            } else {
              // Fetch user by ID if not in recent chats
              try {
                const userResponse = await axios.get(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getUser/${paramsUserId}`,
                  {
                    headers: {
                      authorization: `Bearer ${token}`,
                    },
                  }
                );
                setSelectedUser(userResponse.data.user);
              } catch (error) {
                console.error("Error fetching user by ID:", error);
              }
            }
          }
        } else {
          // Search users
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getChatUsers/${search}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setAllUsers(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
      } finally {
        setTimeout(() => setLoading(false), 800); // Reduced timeout
      }
    }

    fetchUsers();
  }, [search, authState?.id, paramsUserId]);

  // Fetch messages when user is selected
  useEffect(() => {
    async function fetchMessages() {
      if (!authState?.id || !selectedUser?._id) return;
      
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem("token")?.replaceAll('"', "");
        if (!token) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/messages/chat/${authState.id}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.status === 200) {
          setMessages(response.data || []);
          if (deviceType === "phone") {
            setShowChats(true);
          }
          
          // Scroll to bottom after messages are loaded and rendered
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            }
          }, 200);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setTimeout(() => setLoadingMessages(false), 800);
      }
    }

    fetchMessages();
  }, [selectedUser, authState?.id, deviceType]);

  const handleClick = (user) => {
    if (selectedUser?._id !== user._id) {
      // Reset unread count
      const updatedUser = { ...user, unreadCount: 0 };
      setSelectedUser(updatedUser);
      setSearch("");
      setMessages([]); // Clear previous messages
  
      // Update URL
      const params = new URLSearchParams(window.location.search);
      params.set("id", user._id);
      window.history.replaceState(null, "", `/messages?${params.toString()}`);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !authState?.id || !selectedUser?._id || !socketRef.current) {
      return;
    }

    const messageData = {
      senderId: authState.id,
      receiverId: selectedUser._id,
      message: newMessage,
    };

    socketRef.current.emit("private_message", messageData);
    
    // Add message to local state immediately
    setMessages((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        message: newMessage, 
        senderId: authState.id,
        timestamp: new Date().toISOString()
      },
    ]);
    
    setNewMessage("");
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    console.log(messagesEndRef.current)
    if (messagesEndRef.current && messages.length > 0) {
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 1000);
    }
  }, [messages,selectedUser]);

  const isSearching = search.trim() !== "";
  const hasUsers = allUsers.length > 0;

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
            setShowChats(false);
            setMessages([]);
          }}
        >
          All Users
        </Button>
      )}
      
      <HStack spacing={0} overflow="hidden" alignItems="flex-start">
        {/* Users List Section */}
        {!showChats && (
          <Box
            width={deviceType !== "phone" ? "30%" : "100%"}
            borderRight="1px solid"
            borderColor="gray.200"
            overflowY="auto"
            bg="gray.50"
            minHeight="80vh"
          >
            <Box position="relative" mt={1} rounded="md" shadow="sm">
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                pr="2"
                bg="gray.100"
                rounded="md"
                borderColor="gray.300"
                focusBorderColor="indigo.500"
              />
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" mt="4">
                <Spinner size="md" />
              </Box>
            ) : (
              <VStack spacing={4} pt="2">
                {!isSearching && !hasUsers ? (
                  <Text textAlign="center" mt="4" color="gray.500">
                    No recent chats
                  </Text>
                ) : isSearching && !hasUsers ? (
                  <Text textAlign="center" mt="4" color="gray.500">
                    No users found
                  </Text>
                ) : (
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
                        size="md"
                      />
                      <Box flex="1">
                        <Text fontWeight="bold">
                          {user.username}
                        </Text>
                        {user?.unreadCount > 0 && (
                          <Box
                            display="inline-block"
                            backgroundColor="red.500"
                            color="white"
                            borderRadius="full"
                            px="2"
                            py="1"
                            fontSize="xs"
                            ml="2"
                          >
                            {user.unreadCount}
                          </Box>
                        )}
                      </Box>
                    </HStack>
                  ))
                )}
              </VStack>
            )}
          </Box>
        )}

        {/* Chat Section */}
        {(showChats || deviceType !== "phone") && (
          <Box
            width={deviceType !== "phone" ? "70%" : "100%"}
            height="80vh"
            display="flex"
            flexDirection="column"
            px={4}
            border="1px solid #e5e5e5"
            borderRadius="md"
          >
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
                    size="md"
                  />
                  <Text ml={2} fontWeight="bold">
                    {selectedUser.username}
                  </Text>
                </Flex>

                {/* Chat Messages Box */}
                <Box flex="1" overflowY="auto" maxHeight="70vh" p={3}>
                  {loadingMessages ? (
                    <Box display="flex" justifyContent="center" mt="4">
                      <Spinner size="md" />
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {messages.map((msg) => (
                        <Box
                          key={msg.id || msg._id}
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
                          {msg.timestamp && (
                            <Text fontSize="xs" color="gray.500" mt="1">
                              {formatDateTime(msg.timestamp)}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}
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
                  <Button 
                    colorScheme="blue" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </HStack>
              </>
            ) : (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="100%"
              >
                <Text textAlign="center" color="gray.500" fontSize="lg">
                  Select a user to start chatting
                </Text>
              </Box>
            )}
          </Box>
        )}
      </HStack>
    </>
  );
};

export default Dms;