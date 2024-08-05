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

export default function Channel({
  channelDetail,
  posts,
  isFollowed,
  followers,followings
}) {

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
                postsCount={posts?.length}
                followersCount={followers?.length}
                followingCount={followings?.length}
                {...channelDetail}
                isFollowed={isFollowed}
              />
              {posts.data && posts.data.length ? (
                posts.data.map((post) => <PostCard key={post._id} post={post} submitBookmark={null} />)
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
