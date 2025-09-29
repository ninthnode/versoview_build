"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import Channel from "@/components/channels/channel";
import { Box } from "@chakra-ui/react";
import {
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
  clearChannel
} from "@/redux/channel/channelActions";
import {
  getEditionsByUserID
} from "@/redux/publish/publishActions";
import {
  clearTitle,
  setNavTitle
} from "@/redux/navbar/action";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import { useUnreadCount } from "@/contexts/UnreadCountContext";

const VIEW_OPTIONS = {
  posts: "Posts",
  editions: "Editions",
};

const ChannelPage = ({
  params,
  channelData,
  posts,
  followers,
  followings,
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
  addRemoveBookmarks,
  setNavTitle,
  user,
  isPostLoading,
  isChannelLoading,
  getEditionsByUserID,
  userEditions,
  clearChannel,
  clearTitle
}) => {
  const { id } = params;
  const { setAsRead } = useUnreadCount();
  const [view, setView] = useState(VIEW_OPTIONS.posts);

  // Derive data directly from Redux store - single source of truth
  const postList = useMemo(() => {
    return Array.isArray(posts?.data) ? posts.data : [];
  }, [posts]);

  const editionList = useMemo(() => {
    return Array.isArray(userEditions) ? userEditions : [];
  }, [userEditions]);

  // Initialize/reset when channel ID changes
  useEffect(() => {
    clearChannel();
    clearTitle();
    fetchChannel(id);
  }, [id]);

  // Fetch related data when channel loads - WITH ID VALIDATION
  useEffect(() => {
    if (!channelData || !channelData._id || !channelData.userId?._id) return;

    // Ensure channelData matches the current URL id parameter to prevent stale data
    if (channelData.username !== id) return;

    const channelId = channelData._id;
    const userId = channelData.userId._id;

    // Fetch all related data
    fetchFollowings(userId);
    fetchFollowers(channelId);
    fetchPosts(channelId);
    getEditionsByUserID(userId);

    // Set navigation title
    setNavTitle(channelData.channelName, channelData.channelIconImageUrl);

    // Mark as read
    if (user && channelId) {
      setAsRead(channelId);
    }
  }, [channelData, id]);

  // Handle bookmark toggle for posts
  const handleBookmarkPost = useCallback(async (type, postId) => {
    try {
      const result = await addRemoveBookmarks(type, postId);
      if (result && channelData?._id) {
        // Refetch posts to get updated bookmark status
        fetchPosts(channelData._id);
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  }, [addRemoveBookmarks, fetchPosts, channelData]);

  // Handle bookmark toggle for editions
  const handleBookmarkEdition = useCallback(async (type, editionId) => {
    try {
      const result = await addRemoveBookmarks(type, editionId);
      if (result && channelData?.userId?._id) {
        // Refetch editions to get updated bookmark status
        getEditionsByUserID(channelData.userId._id);
      }
    } catch (error) {
      console.error("Error bookmarking edition:", error);
    }
  }, [addRemoveBookmarks, getEditionsByUserID, channelData]);

  return (
    <Box>
      <Channel
        key={id}
        channelDetail={channelData}
        followers={followers}
        followings={followings}
        posts={postList}
        submitBookmarkPost={handleBookmarkPost}
        isFollowed={false}
        channelId={id}
        isPostLoading={isPostLoading}
        isChannelLoading={isChannelLoading}
        options={VIEW_OPTIONS}
        view={view}
        setView={setView}
        userEditions={editionList}
        submitBookmarkEdition={handleBookmarkEdition}
      />
    </Box>
  );
};

const mapStateToProps = (state) => ({
  channelData: state.channel.channel,
  posts: state.channel.posts,
  followers: state.channel.followers,
  followings: state.channel.followings,
  isChannelLoading: state.channel.isChannelLoading,
  isPostLoading: state.channel.isPostLoading,
  user: state.auth.user?.user,
  userEditions: state.publish.userEditions
});

const mapDispatchToProps = {
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
  addRemoveBookmarks,
  setNavTitle,
  getEditionsByUserID,
  clearChannel,
  clearTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPage);
