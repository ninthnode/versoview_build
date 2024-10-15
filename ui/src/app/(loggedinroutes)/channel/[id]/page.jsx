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
import {
  getEditionsByUserID
} from "@/redux/publish/publishActions";
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
  isChannelLoading,
  getEditionsByUserID,
  userEditions
}) => {
  const { id } = params;

  const [postList, setPostList] = useState([]);

  const options = {
    posts: "Posts",
    editions: "Editions",
  };
  
  const [view, setView] = useState(options.posts);

  useEffect(() => {
    if(user){
      fetchChannel(id);
    }
  }, [id,user]);
  useEffect(() => {
    if (channelData&& user) {
      fetchFollowings(channelData.userId._id);
      fetchFollowers(id);
      setNavTitle(
        channelData.channelName,
        channelData.channelIconImageUrl 
      );
      if(view==options.posts)
        fetchPosts(id);
      if(view==options.editions)
        getEditionsByUserID(channelData.userId._id);
    }
  }, [channelData,user,view]);

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
          options={options}
          view={view}
          setView={setView}
          userEditions={userEditions}
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
  getEditionsByUserID
};

export default connect(mapStateToProps, mapDispatchToProps)(Page);
