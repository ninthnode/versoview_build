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
import Chats from "@/app/(loggedinroutes)/chats";
import { usePathname } from "next/navigation";
import useDeviceType from "@/components/useDeviceType";
import { RightSidebarRoutes } from "@/routes";
function RightSidebar({userDetails,user,fetchUser, followings, fetchfollowChannelList}) {
  const path = usePathname();
  const deviceType = useDeviceType();
  const ShowSidebarIf = RightSidebarRoutes.find((route) => path.startsWith(route)) && deviceType=='desktop';
    useEffect(() => {
        if(ShowSidebarIf &&user){
            fetchfollowChannelList(); 
             fetchUser(user.id);
        }
      }, [ShowSidebarIf]);
  return ShowSidebarIf&&(
    <Box>
      <Heading as='h4' fontSize='lg' fontWeight='bold' mb='2'>Chats</Heading>
      <Divider/>
      <Chats user={user}/>

      <Heading as='h4' fontSize='lg' fontWeight='bold' mt='4' mb='2'>Following</Heading>
      <Divider/>

      {(userDetails && followings) ? (
        <Following
          followings={followings}
          user={userDetails}
          fetchfollowChannelList={fetchfollowChannelList}
        />
      ):
      (<Spinner color="#333" mt='2'/>)}
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

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(RightSidebar));
