"use client";
import React, { useEffect, useState } from "react";
import { Box, Avatar, Flex, HStack, Spinner, Divider } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";
import get from "@/app/utils/get";
import { useSelector,useDispatch } from "react-redux";
import AvatarShimmer from "../../../components/posts/AvatarShimmer";
import {getAllPinnedChannels} from "@/redux/channel/channelActions";

const StatusItem = ({ status }) => {
  const authState = useSelector((s) => s.auth?.user?.user);
 
  const [unread, setUnread] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const getUnread = () => {
    return get(`post/getAllUnreadPost/${status._id}`)
      .then((r) => r.data?.length)
      .catch(() => 0);
  };
  const setReadPost = () => {
    return get(`post/setReadPost/${status._id}`)
      .then((r) => r.data?.length)
      .catch(() => 0);
  };

  useEffect(() => {
    if (authState) {
      getUnread().then((count) => {
        setUnread(count);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [status.id]);
  return (
    <Flex direction="column" alignItems="center" position="relative">
    <div onClick={() => setReadPost()} >
      <Link href={`/channel/${status.username}`}>
        <Avatar
          size="lg"
          borderRadius={10}
          src={status.channelIconImageUrl}
        />
        {!isLoading ? (
          unread > 0 && (
            <Box
              zIndex="10"
              alignSelf="end"
              mt="-4"
              fontSize="xs"
              color="white"
              bg="#333"
              borderRadius="xl"
              px={2}
              w="min-content"
              position="absolute"
              right={0}
            >
              {unread}
            </Box>
          )
        ) : (
          <Spinner size="sm" />
        )}
      </Link>
      </div>
    </Flex>
  );
};

const getChannelsForLoggedoutUser = () => {
  return axios
    .get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getAllChannelLoggedoutUser`
    )
    .then((r) =>
      r.data.data.map((c) => ({
        id: c._id,
        name: c.channelName,
        channelIconImageUrl: c.channelIconImageUrl,
      }))
    );
};

const StatusSlider = () => {
  const [channels, setChannels] = useState([]);
  const authState = useSelector((s) => s.auth?.user?.user);
  const authVerified = useSelector((s) => s.auth?.userVerified);
  const pinnedChannelData = useSelector((s) => s.channel.pinnedChannels);
  const dispatch = useDispatch();


  useEffect(() => {
    if(authVerified){
      dispatch(getAllPinnedChannels())
    }
  }, [authVerified]);
  if(pinnedChannelData.length==0) return <AvatarShimmer/>
  return pinnedChannelData.length>0&& (
    <Box
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
    >
      <HStack spacing={4} mb={2}  px={4}>
        {pinnedChannelData.map((status) => (
          <StatusItem key={status._id} status={status} />
        ))}
      </HStack>
      <Divider />
    </Box>
  );
};

export default StatusSlider;
