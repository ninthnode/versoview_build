"use client";

// import { SlIcon } from "@shoelace-style/shoelace";
import {
  Flex,
  Image,
  Heading,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Container,
  Spinner,
} from "@chakra-ui/react";

import About from "./about";
import useSWR from "swr";
import PostCard from "./postCard";

const getFollowing = (endpoint) =>
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/${endpoint}`, {
    headers: {
      authorization: `Bearer ${localStorage
        .getItem("token")
        .replaceAll('"', "")}`,
    },
  })
    .then((r) => r.json())
    .then((r) => r.data);

export default function Channel({
  channelId,
  channelDetail,
  posts,
  isFollowed,
  isPostsLoading,
}) {
  const { data: followers = [], mutate } = useSWR(
    `followersList/${channelId}`,
    getFollowing
  );
  const { data: followings = [] } = useSWR(`followChannelList/${channelId}`, getFollowing);

  return (
    <Box maxW='2xl'>
      <Box>
        <Tabs>
          <TabList>
            <Tab>Latest</Tab>
            <Tab>Style</Tab>
            <Tab>Explore</Tab>
            <Tab>Inspire</Tab>
            <Tab>Dine</Tab>
          </TabList>

          <TabPanels>
            <TabPanel paddingInline={0}>
              <About
                refetchFollowers={mutate}
                postsCount={posts?.length}
                followersCount={followers?.length}
                followingCount={followings?.length}
                {...channelDetail}
                isFollowed={isFollowed}
              />
              {posts.data&&posts.data.length ? (
                posts.data.map((post) => <PostCard key={post._id} post={post}/>)
              ) : (
                <p className="mt-4 text-sm italic font-light text-center text-gray-600">
                  This channel has no posts !
                </p>
              )}
            </TabPanel>
            <TabPanel>
              <Box mt={2}>
                <About
                  postsCount={posts?.length}
                  followersCount={followers?.length}
                  followingCount={followings?.length}
                  {...channelDetail}
                  isFollowed={isFollowed}
                />
                <p>Style</p>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box mt={2}>
                <About
                  postsCount={posts?.length}
                  followersCount={followers?.length}
                  followingCount={followings?.length}
                  {...channelDetail}
                  isFollowed={isFollowed}
                />
                <p>Explore</p>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box mt={2}>
                <About
                  postsCount={posts?.length}
                  followersCount={followers?.length}
                  followingCount={followings?.length}
                  {...channelDetail}
                  isFollowed={isFollowed}
                />
                <p>Inspire</p>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box mt={2}>
                <About
                  postsCount={posts?.length}
                  followersCount={followers?.length}
                  followingCount={followings?.length}
                  {...channelDetail}
                  isFollowed={isFollowed}
                />
                <p>Dine</p>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box mt={2}>
                <About {...channelDetail} isFollowed={isFollowed} />
                <p>Stay</p>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
