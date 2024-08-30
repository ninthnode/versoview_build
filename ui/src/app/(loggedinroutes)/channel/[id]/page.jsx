"use client";
import React, { useState,useEffect } from "react";
import { connect } from "react-redux";
import Channel from "@/components/channels/channel";
import { Box, Spinner } from "@chakra-ui/react";
import {
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
} from "@/redux/channel/channelActions";
import { setNavTitle } from "@/redux/navbar/action";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";


const Page = ({
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
  isChannelLoading
}) => {
  const { id } = params;

  const [postList, setPostList] = useState([]);

  useEffect(() => {
    if(user){
      fetchChannel(id);
      fetchPosts(id);
    }
  }, [id,user]);
  useEffect(() => {
    if (channelData) {
      fetchFollowings(channelData.userId);
      fetchFollowers(id);
      setNavTitle(
        channelData.channelName,
        channelData.channelIconImageUrl 
      );
    }
  }, [channelData]);

  const submitBookmarkPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    const updatedData = { isBookmarked: res.data.isBookmarked };
    setPostList((prevItems) =>
      prevItems.map((item) =>
        item._id === res.data.postId ? { ...item, ...updatedData } : item
      )
    );
  };

  useEffect(() => {
    if (posts && posts.data) setPostList(posts.data);
  }, [posts]);
  return (
    <Box>
        <Channel
          channelDetail={channelData}
          followers={followers}
          followings={followings}
          posts={postList}
          submitBookmarkPost={submitBookmarkPost}
          isFollowed={false}
          channelId={id}
          isPostLoading={isPostLoading}
          isChannelLoading={isChannelLoading}
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
});

const mapDispatchToProps = {
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
  addRemoveBookmarks,
  setNavTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(Page);
