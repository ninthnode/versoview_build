"use client";
import React, { useEffect, useState } from "react";
import { Box, Avatar, Flex, HStack, Spinner, Divider } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";
import get from "@/app/utils/get";
import { useSelector } from "react-redux";

const StatusItem = ({ status }) => {
  const authState = useSelector((s) => s.auth?.user?.user);

  const [unread, setUnread] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUnread = () => {
    return get(`post/getAllUnreadPost/${status.id}`)
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
      <Link href={`/channel/${status.id}`}>
        <Avatar
          size="lg"
          borderRadius={10}
          name={status.name}
          src={status.avatar}
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
      avatar: c.channelIconImageUrl || "/assets/default-post-image.svg",
    }))
  );
};
const getChannels = () => {
  const token = localStorage.getItem("token").replaceAll('"', "");
  return axios
    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getAllChannel`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((r) =>
      r.data.data.map((c) => ({
        id: c.channelData._id,
        name: c.channelData.channelName,
        avatar:
          c.channelData.channelIconImageUrl || "/assets/default-post-image.svg",
      }))
    );
};

const StatusSlider = () => {
  const [channels, setChannels] = useState([]);
  const authState = useSelector((s) => s.auth?.user?.user);

  useEffect(() => {
    if (authState) getChannels().then(setChannels);
    else getChannelsForLoggedoutUser().then(setChannels);
  }, []);

  return (
    <Box overflowX="scroll" overflowY="hidden" paddingRight={0}>
      <HStack
        spacing={4}
        mb={2}
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
      >
        {channels.map((status) => (
          <StatusItem key={status.id} status={status} />
        ))}
      </HStack>
      <Divider />
    </Box>
  );
};

export default StatusSlider;
