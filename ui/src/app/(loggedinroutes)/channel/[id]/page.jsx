"use client";
import React, { useEffect } from "react";
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
  setNavTitle,
}) => {
  const { id } = params;
  const defaultImageUrl = "/assets/default-post-image.svg";

  useEffect(() => {
    fetchChannel(id);
    fetchPosts(id);
  }, [id]);
  useEffect(() => {
    if (channelData) {
      fetchFollowings(channelData.userId);
      fetchFollowers(id);
      setNavTitle(
        channelData.channelName,
        channelData.channelIconImageUrl ? channelData.channelIconImageUrl.toString() : defaultImageUrl
      );
    }
  }, [channelData]);

  return (
    <Box mx="4">
      {channelData && (
        <Channel
          channelDetail={channelData}
          followers={followers}
          followings={followings}
          userId={channelData.userId}
          posts={posts}
          isFollowed={false}
          channelId={id}
        />
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  channelData: state.channel.channel,
  posts: state.channel.posts,
  followers: state.channel.followers,
  followings: state.channel.followings,
});

const mapDispatchToProps = {
  fetchChannel,
  fetchPosts,
  fetchFollowers,
  fetchFollowings,
  setNavTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(Page);
