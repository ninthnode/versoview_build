import { Spinner } from "@chakra-ui/react";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { Box, Image, Flex, Text, Link } from "@chakra-ui/react";

import {
  followChannel,
  unfollowChannel,
  getFollowingStatus,
} from "@/redux/channel/channelActions";

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
  }, [channelId,isChange]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowChannel(channelId);
      } else {
        await followChannel(channelId);
      }
      setIsChange(!isChange)
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <button
      type="button"
      onClick={() => handleFollowClick()}
      className={`"px-8 ${
        isFollowing && "text-green-500"
      } rounded-lg border-2 ${isFollowing && "border-green-500"}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

const About = ({
  channelIconImageUrl,
  profileTitle,
  channelName,
  about,
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
}) => {
  const defaultImageUrl = "/assets/default-post-image.svg";

  return (
    <Box
      display="flex"
      flexDirection="row"
      p={3}
      minWidth="full"
      bg="gray.100"
      borderRadius="md"
    >
      <Flex flexDirection="column" justifyContent="space-between" mr={4}>
        <Image
          src={channelIconImageUrl ? channelIconImageUrl.toString() : defaultImageUrl}
          alt="Channel"
          borderRadius="md"
          boxSize="100px"
        />
        <Flex flexDirection="column" alignItems="center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <title>Message</title>
            <path
              fill="currentColor"
              d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.2L4 17.2V4h16z"
            />
          </svg>
          <Text fontSize="xs" textTransform="capitalize">Message</Text>
        </Flex>
      </Flex>

      <Box ml={4} flex="1">
        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Flex flexDirection="column">
            <Text fontWeight="bold">{profileTitle}</Text>
            <Text fontWeight="semibold" mt={-1}>{channelName}</Text>
          </Flex>
          <FollowBtn
            channelId={_id}
            getFollowingStatus={getFollowingStatus}
            isLoading={isLoading}
            followChannel={followChannel}
            unfollowChannel={unfollowChannel}
          />
        </Flex>

        <Text mb={2} fontSize="sm">
          {about}
          <br />
          <Link href={url} fontSize="xs" isExternal color="blue.500" textDecoration="underline">
            {url}
          </Link>
        </Text>

        <Flex spacing={8} gap={4}>
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight="bold">{postsCount}</Text>
            <Text fontSize="xs">Posts</Text>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight="bold">0</Text>
            <Text fontSize="xs">Editions</Text>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight="bold">{followingCount}</Text>
            <Text fontSize="xs">Following</Text>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight="bold">{followersCount}</Text>
            <Text fontSize="xs">Followers</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};


const mapStateToProps = (state) => ({
  isLoading: state.channel.isLoading,
});

const mapDispatchToProps = {
  followChannel,
  unfollowChannel,
  getFollowingStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
