'use client'

// src/components/StatusSlider.js
import React, { useEffect, useState } from "react";
import { Box, Avatar, Text, Flex, HStack } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";

const StatusItem = ({ status }) => (
  <Flex direction="column" alignItems="center" mx={2}>
    <Link href={`/channel/${status.id}`}>
      <Avatar
        size="md"
        borderRadius={10}
        name={status.name}
        src={status.avatar}
      />
    </Link>
  </Flex>
);

const getChannels = () =>
  axios
    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/getAllChannel`)
    .then((r) =>
      r.data.data.map((c) => ({
        id: c.channelData._id,
        name: c.channelData.channelName,
        avatar:
          c.channelData.channelIconImageUrl || "https://picsum.photos/500/500",
      }))
    );

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
