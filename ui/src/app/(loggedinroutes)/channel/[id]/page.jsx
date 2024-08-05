"use client"
import React, { useEffect } from "react";
import { connect } from "react-redux";
import Channel from "@/components/channels/channel";
import { Box, Spinner } from "@chakra-ui/react";
import { fetchChannel, fetchPosts,fetchFollowers,fetchFollowings } from "@/redux/channel/channelActions";

const Page = ({ params, channelData, posts,followers,followings, fetchChannel, fetchPosts,fetchFollowers,fetchFollowings }) => {
  const { id } = params;

  useEffect(() => {
    fetchChannel(id);
    fetchPosts(id);
  }, [id]);
  useEffect(() => {
    if(channelData){
      fetchFollowings(channelData.userId);
      fetchFollowers(id);
    }
  }, [channelData])
  


  return (
    <Box ml="4">
    {console.log(followers)}
    {
      channelData&&
      <Channel
        channelDetail={channelData}
        followers={followers}
        followings={followings}
        userId={channelData.userId}
        posts={posts}
        isFollowed={false}
        channelId={id}
      /> 
    }
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
};

export default connect(mapStateToProps, mapDispatchToProps)(Page);
