"use client";

import Channel from "@/components/channels/channel";
import useSWR from "swr";
import { Box } from "@chakra-ui/react";

const getChannelData = (endpoint) =>
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/${endpoint}`, {
    headers: {
      authorization: `Bearer ${localStorage
        .getItem("token")
        .replaceAll('"', "")}`,
    },
  })
    .then((r) => r.json())
    .then((r) => r.data);

const getPostsByChannel = (endpoint) =>
  fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/${endpoint}`
  ).then((r) => r.json());
// .then((r) => r.data);

export default function Page({ params: { id } }) {
  const {
    data: channelData = {},
    error,
    isLoading,
  } = useSWR(`getChannel/${id}`, getChannelData);
  const {
    data: posts = [],
    error: postError,
    isLoading: isPostsLoading,
  } = useSWR(`getPostByChannelId/${id}`, getPostsByChannel);

  return (
    <Box ml="4">
      <Channel
        channelDetail={channelData}
        posts={posts}
        isFollowed={false}
        channelId={id}
      />
    </Box>
  );
}
