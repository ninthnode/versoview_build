import { Spinner } from "@chakra-ui/react";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Avatar, Button } from "@chakra-ui/react";

import {
  followChannel,
  unfollowChannel,
  getFollowingStatus,
} from "@/redux/channel/channelActions";
import { FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

const FollowBtn = ({
  channelId,
  followChannel,
  unfollowChannel,
  isLoading,
  getFollowingStatus,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChange, setIsChange] = useState(false);
  useEffect(() => {
    if (channelId) {
      const fetchFollowingStatus = async () => {
        try {
          const response = await getFollowingStatus(channelId);
          setIsFollowing(response?.channelId === channelId);
        } catch (error) {
          console.error("Error fetching following status:", error);
        }
      };
      fetchFollowingStatus();
    }
  }, [channelId, isChange]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowChannel(channelId);
      } else {
        await followChannel(channelId);
      }
      setIsChange(!isChange);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <Button
      onClick={handleFollowClick}
      fontSize="sm"
      px={4}
      mr={2}
      bg="#f4f4f4"
      rounded="md"
      fontWeight={"light"}
      border="1px solid"
      borderColor={isFollowing ? "green" : "textlight"}
      color={isFollowing ? "green" : "inherit"}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

const About = ({
  channelIconImageUrl,
  profileTitle,
  userId,
  channelName,
  about,
  username,
  url,
  profileBgColor: backgroundColor,
  _id,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  getFollowingStatus,
  isLoading,
  followChannel,
  unfollowChannel,
  isChannelLoading,
  user,
}) => {
  return (
    <Box
      py={4}
      display="flex"
      flexDirection="row"
      minWidth="full"
      bg="lightgray"
      borderRadius="md"
    >
      {isChannelLoading ? (
        <Flex h="150px" w="100%" justifyContent="center" alignItems="center">
          <Spinner color="#333" />
        </Flex>
      ) : (
        <>
          <Flex flexDirection="column" justifyContent="space-between" mr={4}>
            <Avatar
              ml={2}
              src={channelIconImageUrl}
              size="lg"
              alt={channelName}
            />
            {userId&&user&&userId._id != user.id && (
              <Link href={`/messages?id=${userId._id}`}>
              <Flex flexDirection="column" alignItems="center" mb={1} cursor='pointer'>
                <FiMessageSquare size="18px" />
                <Text
                  fontSize="12px"
                  lineHeight={1.2}
                  textTransform="capitalize"
                >
                  Message
                </Text>
              </Flex>
                </Link>
            )}
          </Flex>

          <Flex flexDir="column" justifyContent="space-between">
            <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Flex flexDirection="column">
                <Text
                  fontSize={"lg"}
                  fontWeight="bold"
                  lineHeight="2rem"
                  mr="4"
                >
                  {channelName}
                </Text>
                <Text fontWeight="semibold" mt={-1}>
                  @{username}
                </Text>
              </Flex>
              <FollowBtn
                channelId={_id}
                getFollowingStatus={getFollowingStatus}
                isLoading={isLoading}
                followChannel={followChannel}
                unfollowChannel={unfollowChannel}
              />
            </Flex>

            <Text mb={2} fontSize="sm" w="85%">
              {about}
            </Text>
            <Link
              href={url}
              fontSize="xs"
              isExternal
              color="blue.500"
              textDecoration="underline"
            >
              {url}
            </Link>

            <Flex spacing={8} gap={4} mt={4}>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {postsCount}
                </Text>
                <Text fontSize="12px">Posts</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  0
                </Text>
                <Text fontSize="12px">Editions</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {followingCount}
                </Text>
                <Text fontSize="12px">Following</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {followersCount}
                </Text>
                <Text fontSize="12px">Followers</Text>
              </Flex>
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.channel.isFollowLoading,
  user: state.auth.user?.user,
});

const mapDispatchToProps = {
  followChannel,
  unfollowChannel,
  getFollowingStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
