import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchfollowChannelList } from "@/redux/channel/channelActions";
import { fetchUser } from "@/redux/profile/actions";
import {
    Box,
    Heading,
    Text,
    Spinner,
    Divider
  } from "@chakra-ui/react";
import Following from "@/app/(loggedinroutes)/home/following";
import { usePathname } from "next/navigation";
import useDeviceType from "@/components/useDeviceType";

function RightSidebar({userDetails,authVerified,user,fetchUser, followings, fetchfollowChannelList}) {
  const path = usePathname();
  const deviceType = useDeviceType();
  const SiderbarRoutes = ["/home"];
  const ShowSidebarIf = SiderbarRoutes.find((route) => path.startsWith(route)) && deviceType=='desktop';
    useEffect(() => {
        if(authVerified &&ShowSidebarIf){
            fetchfollowChannelList(); 
             fetchUser(user.id);
        }
      }, [authVerified,ShowSidebarIf]);
  return ShowSidebarIf && (
      <Box px={4} mt='4.4rem' w='100%'>
      <Heading as='h4' fontSize='lg' fontWeight='bold' mb='2'>Following</Heading>
      <Divider/>
      {!userDetails && !followings?.data&&(
        <Spinner color="#333" mt='2'/>
      )}
      {userDetails && followings.data && (
        <Following
          followings={followings}
          user={userDetails}
          fetchfollowChannelList={fetchfollowChannelList}
        />
      )}
    </Box>
  );
}

const mapStateToProps = (state) => ({
  postsState: state.post,
  loading: state.post.loading,
  posts: state.post.posts,
  recentPosts: state.post.recentPosts,
  followings: state.channel.followings,
  user: state.auth.user?.user,
  authVerified: state.auth.userVerified,
  userDetails: state.profile.user,
});

const mapDispatchToProps = {
  fetchfollowChannelList,
  fetchUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(RightSidebar);
