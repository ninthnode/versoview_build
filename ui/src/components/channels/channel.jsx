"use client";
import React, { useState } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Divider,
  Flex,
} from "@chakra-ui/react";
import About from "./about";
import EditionCard from "./EditionCard";
import PostCard from "@/app/(loggedinroutes)/home/postCard";
import PostCardShimmer from "../posts/PostCardShimmer";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaCheck as CheckIcon } from "react-icons/fa";

function ViewBy({ view, setView, options }) {
  return (
    <Menu>
      <Text fontSize="md" m="auto 0">
        View By :
      </Text>
      <MenuButton
        as={Button}
        rightIcon={<MdKeyboardArrowDown fontSize="25px" />}
        bg="transparent"
      >
        {view}
      </MenuButton>
      <MenuList p="0" minW="150px">
        {Object.values(options).map((option) => (
          <React.Fragment key={option}>
            <MenuItem
              w="100%"
              pl={6}
              justifyContent="left"
              onClick={() => {
                setView(option);
              }}
            >
              <Text fontWeight="bold" mr={4}>
                {option}
              </Text>
              {view === option ? <CheckIcon /> : <Box w={4} h={4} />}
            </MenuItem>
            <Divider />
          </React.Fragment>
        ))}
      </MenuList>
    </Menu>
  );
}

export default function Channel({
  channelDetail,
  posts,
  isFollowed,
  followers,
  followings,
  submitBookmarkPost,
  isPostLoading,
  isChannelLoading,
  view,
  setView,
  options,
  userEditions,
  submitBookmarkEdition,
}) {
  // Extract unique sections from posts
  const uniqueSections = Array.from(new Set(posts.map((post) => post.section)));

  // Check if channel is suspended
  const isChannelSuspended = channelDetail?.status === 'suspended';

  return (
    <Box>
      <Box>
        <About
          postsCount={posts?.length}
          editionsCount={userEditions?.length}
          followersCount={followers?.length}
          followingCount={followings?.length}
          {...channelDetail}
          isFollowed={isFollowed}
          isChannelLoading={isChannelLoading}
        />

        {isChannelSuspended ? (
          <Box
            textAlign="center"
            py={8}
            px={4}
            bg="red.50"
            borderRadius="md"
            border="1px solid"
            borderColor="red.200"
            mt={4}
          >
            <Text fontSize="lg" fontWeight="bold" color="red.600" mb={2}>
              Channel Suspended
            </Text>
            <Text color="red.500">
              This channel has been suspended and its content is no longer available.
            </Text>
          </Box>
        ) : (
          <Tabs>
            <TabList px={2} gap={2} w="100%">
              <Box
                display={"flex"}
                alignItems="flex-end"
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
              >
                <Tab pl="0">Latest</Tab>
                {uniqueSections.map((section) => (
                  <Tab key={section} pl="0" fontSize={"sm"}>
                    {section}
                  </Tab>
                ))}
              </Box>
            </TabList>
            <TabPanels>
            <TabPanel p={0}>
              <Flex mt="3" w="100%" justifyContent="flex-end">
                <ViewBy view={view} setView={setView} options={options} />
              </Flex>
              {isPostLoading && <PostCardShimmer />}
              {view === options.posts && posts && posts.length ? (
                posts.map((post,i) => (
                  <Box key={post._id} mt={i > 0 ? "4" : "0"}>
                    <PostCard
                      key={post._id}
                      post={post}
                      submitBookmark={submitBookmarkPost}
                    />
                  </Box>
                ))
              ) : (
                <></>
              )}
            </TabPanel>
            {uniqueSections.map((section) => (
              <TabPanel key={section}>
                {isPostLoading && <PostCardShimmer />}
                {posts.filter((post) => post.section === section).length ? (
                  posts
                    .filter((post) => post.section === section)
                    .map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        submitBookmark={submitBookmarkPost}
                      />
                    ))
                ) : (
                  <></>
                )}
              </TabPanel>
            ))}
           { view == options.editions && (
            userEditions && userEditions.length ? (
              userEditions.map((edition) => (
                <EditionCard
                  key={edition._id}
                  edition={edition}
                  channel={channelDetail}
                  submitBookmarkEdition={submitBookmarkEdition}
                />
              ))
            ) : (
              <p className="mt-4 text-sm italic font-light text-center text-gray-600">
                This channel has no Editions!
              </p>
            ))}
            <TabPanel>
              <PostCardShimmer />
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
          </TabPanels>
        </Tabs>
        )}
      </Box>
    </Box>
  );
}
