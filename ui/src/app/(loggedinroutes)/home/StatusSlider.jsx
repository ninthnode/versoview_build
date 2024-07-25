"use client";

// src/components/StatusSlider.js
import React, { useEffect, useState } from "react";
import { Box, Avatar, Text, Flex, HStack, Spinner } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";
import get from "@/app/utils/get";
import useSWR from "swr";

const StatusItem = ({ status }) => {
  const { data: unread = 0, isLoading: unreadLoading } = useSWR(
    `post/getAllUnreadPost/${status.id}`,
    (k) => get(k, true).then((r) => r.data?.length)
  );

  return (
    <Flex direction="column" alignItems="center" mx={2}>
      <Link href={`/channel/${status.id}`}>
        <Avatar
          size="md"
          borderRadius={10}
          name={status.name}
          src={status.avatar}
        />
        {unread ? (
          <div
            className="z-10 self-end px-2 -mt-4 w-min text-xs text-white bg-black rounded-xl"
            style={{ display: !unread ? "none" : "block" }}
          >
            {unread}
          </div>
        ) : (
          <Spinner size={5} />
        )}
      </Link>
    </Flex>
  );
};

const getChannels = () =>
  axios
    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getAllChannel`)
    .then((r) =>
      r.data.data.map((c) => ({
        id: c.channelData._id,
        name: c.channelData.channelName,
        avatar:
          c.channelData.channelIconImageUrl || "/assets/default-post-image.svg",
      }))
    );

const getUnreadPosts = (channelId) =>
  get(`post/getAllUnreadPost/${channelId}`, true).then((r) => r.data?.length);

const StatusSlider = () => {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    getChannels().then(setChannels);
  }, []);
  return (
    <Box
      overflowX="scroll"
      pb={4}
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
      <HStack spacing={4}>
        {channels.map((status) => (
          <StatusItem key={status.id} status={status} />
        ))}
      </HStack>
    </Box>
  );
};

export default StatusSlider;
