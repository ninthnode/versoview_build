"use client";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import About from "./about";
import PostCard from "@/app/(loggedinroutes)/home/postCard";
import PostCardShimmer from "../posts/PostCardShimmer";

export default function Channel({
  channelDetail,
  posts,
  isFollowed,
  followers,followings,submitBookmarkPost,
  isPostLoading,
  isChannelLoading
}) {

  return (
    <Box maxW='2xl'>
      <Box>
        <Tabs>
          <TabList gap={2} h="3rem">
            <Tab pl="0">Latest</Tab>
            <Tab pl="1">Style</Tab>
            <Tab pl="1">Explore</Tab>
            <Tab pl="1">Inspire</Tab>
            <Tab pl="1">Dine</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <About
                postsCount={posts?.length}
                followersCount={followers?.length}
                followingCount={followings?.length}
                {...channelDetail}
                isFollowed={isFollowed}
                isChannelLoading={isChannelLoading}
              />
              {isPostLoading&&<PostCardShimmer/>}
              {posts && posts.length ? (
                posts.map((post) => <PostCard key={post._id} post={post} submitBookmark={submitBookmarkPost} />)
              ) : (
                <p className="mt-4 text-sm italic font-light text-center text-gray-600">
                  This channel has no posts!
                </p>
              )}
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
