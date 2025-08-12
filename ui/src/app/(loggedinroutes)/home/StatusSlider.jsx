"use client";
import React, { useEffect,useRef, useState } from "react";
import { Box, Avatar, Flex, HStack, Spinner, Divider } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";
import get from "@/app/utils/get";
import { useSelector,useDispatch } from "react-redux";
import AvatarShimmer from "../../../components/posts/AvatarShimmer";
import {getAllPinnedChannels} from "@/redux/channel/channelActions";

const StatusItem = ({ status }) => {
  const authState = useSelector((s) => s.auth?.user?.user);
  const [unread, setUnread] = useState(0); // Initialize with 0 instead of null
  const [isLoading, setIsLoading] = useState(true);

  const getUnread = async () => {
    try {
      const response = await get(`post/getAllUnreadPost/${status._id}`);
      console.log('Unread response:', status); // Debug log
      return response.data?.length || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error); // Better error handling
      return 0;
    }
  };

  const setReadPost = async () => {
    try {
      const response = await get(`post/setReadPost/${status._id}`);
      console.log('Set read response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Error setting post as read:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUnread = async () => {
      if (authState && status._id) {
        setIsLoading(true);
        const count = await getUnread();
        console.log('Fetched unread count:', count); // Debug log
        setUnread(count);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setUnread(0);
      }
    };

    fetchUnread();
  }, [status._id, authState]); // Added authState as dependency

  const handleClick = async () => {
    if (!authState) return;
    
    try {
      await setReadPost();
      // Refresh unread count after marking as read
      const newCount = await getUnread();
      setUnread(newCount);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  return (
    <Flex direction="column" alignItems="center" position="relative" pt={2}>
      <Box position="relative" onClick={handleClick}>
        <Link href={`/channel/${status.username}`}>
          <Avatar
            size="lg"
            borderRadius={10}
            src={status.channelIconImageUrl}
          />
        </Link>
        
        {/* Moved badge inside the Box for better positioning */}
        {!isLoading && unread > 0 && (
          <Box
            position="absolute"
            top="-2"
            right="-2"
            zIndex="10"
            fontSize="xs"
            color="white"
            bg="red.500" // Changed to red.500 for better visibility
            borderRadius="full"
            minW="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid white" // Added white border
          >
            {unread}
          </Box>
        )}
        
        {isLoading && (
          <Box
            position="absolute"
            top="-2"
            right="-2"
            zIndex="10"
          >
            <Spinner size="sm" />
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const StatusSlider = () => {
  const [channels, setChannels] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);
  
  const authState = useSelector((s) => s.auth?.user?.user);
  const authVerified = useSelector((s) => s.auth?.userVerified);
  const pinnedChannelData = useSelector((s) => s.channel.pinnedChannels);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(authVerified){
      dispatch(getAllPinnedChannels())
    }
  }, [authVerified]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed multiplier as needed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if(pinnedChannelData.length === 0) return <AvatarShimmer/>
  
  return pinnedChannelData.length > 0 && (
    <Box
      ref={scrollContainerRef}
      overflowX="scroll"
      __css={{
        "&::-webkit-scrollbar": {
          w: "2",
          h: "1",
        },
        "&::-webkit-scrollbar-track": {
          w: "6",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10",
          bg: "gray.100",
        },
      }}
      overflowY="hidden"
      paddingRight={0}
      cursor="grab"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      userSelect="none" // Prevent text selection while dragging
    >
      <HStack spacing={4} mb={2} px={4}>
        {pinnedChannelData.map((status) => (
          <StatusItem key={status._id} status={status} />
        ))}
      </HStack>
      <Divider />
    </Box>
  );
};

export default StatusSlider;
