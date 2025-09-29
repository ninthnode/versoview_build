import { Spinner } from "@chakra-ui/react";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Avatar, Button } from "@chakra-ui/react";

import {
  followChannel,
  unfollowChannel,
  getFollowingStatus,
  suspendChannel,
  reactivateChannel,
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

const SuspendBtn = ({ channelId, suspendChannel, reactivateChannel, isLoading, isChannelSuspended }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localChannelStatus, setLocalChannelStatus] = useState(isChannelSuspended);

  // Update local status when prop changes
  useEffect(() => {
    setLocalChannelStatus(isChannelSuspended);
  }, [isChannelSuspended]);

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      if (localChannelStatus) {
        await reactivateChannel(channelId);
        setLocalChannelStatus(false);
        alert("Channel reactivated successfully");
      } else {
        await suspendChannel(channelId);
        setLocalChannelStatus(true);
        // alert("Channel suspended successfully");
      }
      // Force reload to get fresh data from server
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(`Error ${localChannelStatus ? 'reactivating' : 'suspending'} channel:`, error);
      alert(`Failed to ${localChannelStatus ? 'reactivate' : 'suspend'} channel`);
      // Reset local status on error
      setLocalChannelStatus(isChannelSuspended);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      fontSize="sm"
      px={4}
      // ml={2}
      bg={localChannelStatus ? "#4CAF50" : "#ff4444"}
      rounded="md"
      fontWeight={"light"}
      border="1px solid"
      borderColor={localChannelStatus ? "green.500" : "red.500"}
      color="white"
      isLoading={isProcessing}
      _hover={{ bg: localChannelStatus ? "#45a049" : "#cc3333" }}
    >
      {localChannelStatus ? "Reactivate Channel" : "Suspend Channel"}
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
  status,
  postsCount = 0,
  editionsCount = 0,
  followersCount = 0,
  followingCount = 0,
  getFollowingStatus,
  isLoading,
  followChannel,
  unfollowChannel,
  isChannelLoading,
  user,
  suspendChannel,
  reactivateChannel,
}) => {
  const isAdmin = user && user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  const isChannelSuspended = status === 'suspended';

  return (
    <Box
      py={4}
      display="flex"
      flexDirection="row"
      // minWidth="full"
      bg={isChannelSuspended ? "red.50" : "lightgray"}
      borderRadius="md"
      border={isChannelSuspended ? "1px solid" : "none"}
      borderColor={isChannelSuspended ? "red.200" : "transparent"}
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
                <Box pt={2}>
                 {isAdmin && (
                  <SuspendBtn
                    channelId={_id}
                    suspendChannel={suspendChannel}
                    reactivateChannel={reactivateChannel}
                    isLoading={isLoading}
                    isChannelSuspended={isChannelSuspended}
                  />
                )}
                </Box>
                {isChannelSuspended && (
                  <Text
                    fontSize="sm"
                    color="red.600"
                    fontWeight="bold"
                    mt={1}
                    bg="red.100"
                    px={2}
                    py={1}
                    borderRadius="md"
                    display="inline-block"
                  >
                    SUSPENDED
                  </Text>
                )}
              </Flex>
              <Flex>
                {!isChannelSuspended && (
                  <FollowBtn
                    channelId={_id}
                    getFollowingStatus={getFollowingStatus}
                    isLoading={isLoading}
                    followChannel={followChannel}
                    unfollowChannel={unfollowChannel}
                  />
                )}
              </Flex>
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
                  {postsCount || 0}
                </Text>
                <Text fontSize="12px">Posts</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {editionsCount || 0}
                </Text>
                <Text fontSize="12px">Editions</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {followingCount || 0}
                </Text>
                <Text fontSize="12px">Following</Text>
              </Flex>
              <Flex fontSize="sm" flexDirection="column" alignItems="left">
                <Text fontWeight="bold" lineHeight={1}>
                  {followersCount || 0}
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
  suspendChannel,
  reactivateChannel,
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
