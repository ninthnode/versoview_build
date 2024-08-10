"use client";

import get from "@/app/utils/get";
import {
  Box,
  Spinner,
  Link,
  IconButton,
  Flex,
  Image,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import {  FaCheck as CheckIcon } from "react-icons/fa";
import { IoStar as StarIcon, IoStarOutline as StarIconOutlined } from "react-icons/io5";

const pinChannel = (id) =>
  get(`channel/pinChannel/${id}`, true, { method: "PUT" }).then((r) => r.data);
const unpinChannel = (id) =>
  get(`channel/unpinChannel/${id}`, true, { method: "PUT" }).then(
    (r) => r.data
  );

const options = {
  Pinned: "PINNED",
  ByGenre: "BY GENRE",
  AZ: "A - Z",
  Recent: "RECENT",
};

function ViewBy({ view, setView, setSortedFollowings }) {
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<MdKeyboardArrowDown fontSize='25px'/>}
          bg="transparent"
        >
          View By
        </MenuButton>
        <MenuList p='0' minW='150px'>
          {Object.values(options).map((option) => (
            <>
            <MenuItem
              w='100%'
              pl={6}
              justifyContent='left'
              key={option}
              onClick={() => {
                setView(option);
                setSortedFollowings((followings) =>
                  followings.sort(sortFn(option))
                );
              }}
            >
              <Text 
              fontWeight='bold' mr={4}>{option}</Text>
              {view === option ? (
                <CheckIcon />
              ) : (
                <Box w={4} h={4} />
              )}
            </MenuItem>
            <Divider />
            </>
          ))}
        </MenuList>
      </Menu>
    </>
  );
}

const sortFn = (view) => {
  switch (view) {
    case options.Pinned:
      return (a, b) => !!b?.pinned - !!a?.pinned;
    case options.ByGenre:
      return (a, b) => +(a?.genre > b?.genre);
    case options.Recent:
      return (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt);
    case options.AZ:
      return (a, b) => a?.channelName.localeCompare(b?.channelName);
  }
};

const Following = ({ followings, user }) => {
  const [view, setView] = useState(options.Pinned);
  const [followingsDataSorted, setfollowingsDataSorted] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(true);
  useEffect(() => {
    if (followings.data) {
      const tempList = followings.data
      .filter((i) => i.channelId)
      .map((i) => ({ ...i.channelId, pinned: i.pinned }))
      .toSorted(sortFn(options.Pinned));
      setfollowingsDataSorted(tempList);
      setFollowingLoading(false);
    }
  }, [followings]);

  const handlePinUnpin = (following) => {
    const action = following.pinned ? unpinChannel : pinChannel;
    action(following._id).then(() => {
      setfollowingsDataSorted((prevFollowings) =>
        prevFollowings
          .map((i) =>
            i._id === following._id ? { ...i, pinned: !i.pinned } : i
          )
          .toSorted(sortFn(view))
      );
    });
  };

  return (
    <Box>
      <Box px={0} py={3} bg={user.profileBgColor}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Avatar
              src={user.profileImageUrl || "/assets/default-post-image.svg"}
              size="lg"
              alt={user.channelName}
            />
            <Box ml={3}>
              <Text fontWeight="bold" fontSize="16px">
                {user.channelName}
              </Text>
              <Text fontSize="sm" color="textlight">
                {Array.isArray(user.genre) &&
                  user.genre.sort().slice(0, -2).join(", ") +
                    user.genre.sort().slice(-2).join(" & ")}
              </Text>
            </Box>
          </Flex>
          <IconButton
            mr={4}
            aria-label="Menu"
            colorScheme={user.profileBgColor}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400 size-6"
                viewBox="0 0 24 24"
              >
                <title>Menu</title>
                <path
                  fill="currentColor"
                  d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
                />
              </svg>
            }
          />
        </Flex>
      </Box>
      <Divider />
      <Flex justify="flex-start">
        <ViewBy
          view={view}
          setView={setView}
          setSortedFollowings={setfollowingsDataSorted}
        />
      </Flex>
      <Divider />
      {followingLoading ? (
        <Spinner />
      ) : (
        followingsDataSorted.length>0?
        followingsDataSorted?.map((following) => (
          <Flex
            key={following._id || crypto.randomUUID()}
            py={2}
            align="center"
            justify="space-between"
            _hover={{ shadow: "md", bg: "gray.50" }}
            transition="shadow 0.2s, background-color 0.2s"
          >
            <Flex alignItems='center'>
              <IconButton
                fontSize='25px'
                aria-label="Pin Channel"
                colorScheme={user.profileBgColor}
                onClick={() => handlePinUnpin(following)}
                icon={
                  following.pinned ? (
                    <StarIcon color="green" />
                  ) : (
                    <StarIconOutlined color="gray" />
                  )
                }
              />
              <Avatar
                src={
                  following?.channelIconImageUrl ||
                  "/assets/default-post-image.svg"
                }
                size="lg"
                alt={user.channelName}
              />
              <Box ml={3}>
                <Link href={`/channel/${following._id}`}>
                  <Text fontSize='md' fontWeight="bold">{following?.channelName}</Text>
                </Link>
                <Text fontSize="sm">
                  {Array.isArray(following.userId?.genre) &&
                    following.userId?.genre?.join(" - ")}
                </Text>
              </Box>
            </Flex>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 size-6"
              viewBox="0 0 24 24"
            >
              <title>Icon</title>
              <path
                fill="currentColor"
                d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
              />
            </svg>
          </Flex>
        )):<Text mt='4' textAlign={'center'}>No Followings</Text>
      )}
    </Box>
  );
};

export default Following;
