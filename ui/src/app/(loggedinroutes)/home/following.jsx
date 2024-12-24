"use client";

import get from "@/app/utils/get";
import {
  Box,
  Spinner,
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
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaCheck as CheckIcon } from "react-icons/fa";
import {
  IoStar as StarIcon,
  IoStarOutline as StarIconOutlined,
} from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import { useDispatch } from "react-redux";
import {
  unfollowChannel,
  getAllPinnedChannels
} from "@/redux/channel/channelActions";

const pinChannel = (id) =>
  get(`channel/pinChannel/${id}`, true, { method: "PUT" }).then((r) => r.data);
const unpinChannel = (id) =>
  get(`channel/unpinChannel/${id}`, true, { method: "PUT" }).then(
    (r) => r.data
  );

const options = {
  Recent: "RECENT",
  Pinned: "PINNED",
  ByGenre: "BY GENRE",
  AZ: "A - Z",
};

function ViewBy({ view, setView, setSortedFollowings }) {
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<MdKeyboardArrowDown fontSize="25px" />}
          bg="transparent"
        >
          View By
        </MenuButton>
        <MenuList p="0" minW="150px">
          {Object.values(options).map((option) => (
            <>
              <MenuItem
                w="100%"
                pl={6}
                justifyContent="left"
                key={option}
                onClick={() => {
                  setView(option);
                  setSortedFollowings((followings) =>
                    followings.sort(sortFn(option))
                  );
                }}
              >
                <Text fontWeight="bold" mr={4}>
                  {option}
                </Text>
                {view === option ? <CheckIcon /> : <Box w={4} h={4} />}
              </MenuItem>
              <Divider />
            </>
          ))}
        </MenuList>
      </Menu>
    </>
  );
}

function ListDropdown({ handleUnFollowChannel,channelId }) {
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          bg="transparent"
          mr={4}
        >
          <FiMoreHorizontal />
        </MenuButton>
        <MenuList p="0" minW="150px">
          {Object.values(['Unfollow']).map((option) => (
            <>
              <MenuItem
                w="100%"
                pl={6}
                justifyContent="left"
                key={option}
                onClick={() => {
                  handleUnFollowChannel(channelId)
                }}
              >
                <Text fontWeight="bold" mr={4}>
                  {option}
                </Text>
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
      return (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt);
    case options.AZ:
      return (a, b) => a?.channelName.localeCompare(b?.channelName);
  }
};

const Following = ({ followings, user,fetchfollowChannelList }) => {
  const [view, setView] = useState(options.Recent);
  const [followingsDataSorted, setfollowingsDataSorted] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (followings.data) {
      const tempList = followings.data
        .filter((i) => i.channelId)
        .map((i) => ({ ...i.channelId, pinned: i.pinned }))
        .toSorted(sortFn(options.Recent));
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
    dispatch(getAllPinnedChannels())
  };

  const handleUnFollowChannel = async(channelId) => {
    await dispatch(unfollowChannel(channelId));
    fetchfollowChannelList()
  }

  return (
    <Box  mb='4'>
      {/* <Box px={0} py={3} bg={user.profileBgColor}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Avatar
              borderRadius={10}
              src={user.profileImageUrl}
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
            variant="ghost"
            color="#333"
            icon={<FiMoreHorizontal />}
          />
        </Flex>
      </Box> */}
      {/* <Divider /> */}
      <Flex justify="flex-start" py={3}>
        <ViewBy
          view={view}
          setView={setView}
          setSortedFollowings={setfollowingsDataSorted}
        />
      </Flex>
      <Divider />
      {followingLoading ? (
        <Spinner />
      ) : followingsDataSorted.length > 0 ? (
        followingsDataSorted.map((following) => (
          <Flex
            key={following._id || crypto.randomUUID()}
            py={2}
            align="center"
            justify="space-between"
            _hover={{ shadow: "md", bg: "gray.50" }}
            transition="shadow 0.2s, background-color 0.2s"
          >
            <Flex alignItems="center">
              <IconButton
                fontSize="25px"
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
                borderRadius={10}
                src={following?.channelIconImageUrl}
                size="lg"
                alt={user.channelName}
              />
              <Box ml={3}>
                <Link href={`/channel/${following.username}`}>
                  <Text fontSize="md" fontWeight="bold">
                    {following?.channelName}
                  </Text>
                </Link>
                <Text fontSize="sm">
                  {Array.isArray(following.userId?.genre) &&
                    following.userId?.genre[0]
                    }
                </Text>
              </Box>
            </Flex>
            <ListDropdown
              channelId={following._id}
              handleUnFollowChannel={handleUnFollowChannel}
            />
          </Flex>
        ))
      ) : (
        <Text mt="4" textAlign={"center"}>
          No Followings
        </Text>
      )}
    </Box>
  );
};

export default Following;
