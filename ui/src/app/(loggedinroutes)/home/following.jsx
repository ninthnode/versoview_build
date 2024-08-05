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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { connect } from "react-redux";
import {
  FaStar as StarIcon,
  FaCheck as CheckIcon,
} from "react-icons/fa";
import { CiStar as StarIconOutlined } from "react-icons/ci";


const pinChannel = (id) =>
  get(`channel/pinChannel/${id}`, true, { method: "PUT" }).then((r) => r.data);
const unpinChannel = (id) =>
  get(`channel/unpinChannel/${id}`, true, { method: "PUT" }).then(
    (r) => r.data
  );

const options = {
  Pinned: "Pinned",
  Recent: "Recent",
  AZ: "A - Z",
  ByGenre: "By Genre",
};

function ViewBy({ view, setView, setSortedFollowings }) {
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<MdKeyboardArrowDown />}
          colorScheme="teal"
        >
          View By
        </MenuButton>
        <MenuList>
          {Object.values(options).map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                setView(option);
                setSortedFollowings((followings) =>
                  followings.sort(sortFn(option))
                );
              }}
            >
              {view === option ? (
                <CheckIcon mr={2} />
              ) : (
                <Box mr={2} w={4} h={4} />
              )}
              {option}
            </MenuItem>
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
    if (followings.data && followings.data.length > 0) {
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
    <Box py={4} px={6} bg={user.profileBgColor} rounded="md" shadow="md">
      <Flex align="center">
        <Image
          src={user.profileImageUrl || "/assets/default-post-image.svg"}
          alt=""
          boxSize="64px"
          borderRadius="md"
          m={2}
        />
        <Box ml={3}>
          <Text fontWeight="bold">{user.channelName}</Text>
          <Text fontSize="sm" color="gray.400">
            {Array.isArray(user.genre) &&
              user.genre
                .sort()
                .slice(0, -2)
                .join(", ") +
                user.genre.sort().slice(-2).join(" & ")}
          </Text>
        </Box>
        <IconButton
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
    <Flex justify="flex-end" py={2}>
      <ViewBy
        view={view}
        setView={setView}
        setSortedFollowings={setfollowingsDataSorted}
      />
    </Flex>
    {followingLoading ? (
      <Spinner />
    ) : (
      followingsDataSorted?.map((following) => (
        <Flex
          key={following._id || crypto.randomUUID()}
          py={2}
          px={6}
          align="center"
          justify="space-between"
          _hover={{ shadow: "md", bg: "gray.50" }}
          transition="shadow 0.2s, background-color 0.2s"
        >
          <Flex align="center">
            <IconButton
              aria-label="Pin Channel"
              colorScheme={user.profileBgColor}
              onClick={() => handlePinUnpin(following)}
              icon={
                following.pinned ? (
                  <StarIcon color="green" />
                ) : (
                  <StarIconOutlined colorScheme="gray.400" />
                )
              }
            />
            <Image
              src={
                following?.channelIconImageUrl ||
                "/assets/default-post-image.svg"
              }
              alt=""
              boxSize="48px"
              borderRadius="md"
              ml={3}
            />
            <Box ml={3}>
              <Link href={`/channel/${following._id}`}>
                <Text fontWeight="bold">{following?.channelName}</Text>
              </Link>
              <Text fontSize="sm">
                {Array.isArray(following?.genre) &&
                  following?.genre?.join(" - ")}
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
      ))
    )}
  </Box>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Following);
