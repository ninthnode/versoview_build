import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchfollowChannelList } from "@/redux/channel/channelActions";
import { fetchUser } from "@/redux/profile/actions";
import { Box, Heading, Text, Spinner, Divider } from "@chakra-ui/react";
import Following from "@/app/(loggedinroutes)/home/following";
import Chats from "@/app/(loggedinroutes)/chats";
import { usePathname } from "next/navigation";
import useDeviceType from "@/components/useDeviceType";
import { RightSidebarRoutes } from "@/routes";
function RightSidebar({
  userDetails,
  user,
  fetchUser,
  followings,
  fetchfollowChannelList,
}) {
  const path = usePathname();
  const deviceType = useDeviceType();
  const ShowSidebarIf =
    RightSidebarRoutes.find((route) => path.startsWith(route)) &&
    deviceType == "desktop";
  useEffect(() => {
    if (ShowSidebarIf && user) {
      fetchfollowChannelList();
      fetchUser(user.id);
    }
  }, [ShowSidebarIf]);

  let lastScrollTop = 0;

  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const sidebarContent = document.getElementById("content_wrapper");
    const mainContainer = document.getElementById("main_container");
  
    if (!sidebar || !sidebarContent || !mainContainer) return;
  
    // Enable smooth scrolling
    sidebarContent.style.transition = "transform 0.3s ease-out";
  
    let offset = 0; // Keeps track of sidebar movement
  
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportH = window.innerHeight;
      const contentH = sidebarContent.getBoundingClientRect().height;
      const mainContainerH = mainContainer.getBoundingClientRect().height;
      const sidebarTop = sidebar.getBoundingClientRect().top + window.scrollY;
  
      if (contentH < mainContainerH) {
        if (scrollTop > lastScrollTop) {
          // Scrolling Down: Move sidebar content up
          offset = Math.max(
            -(contentH - viewportH + sidebarTop),
            offset - (scrollTop - lastScrollTop)
          );
        } else {
          // Scrolling Up: Move sidebar content down smoothly
          offset = Math.min(0, offset + (lastScrollTop - scrollTop));
        }
  
        sidebarContent.style.transform = `translateY(${offset}px)`;
        sidebarContent.style.position = "fixed";
      }
  
      lastScrollTop = scrollTop;
    };
  
    window.addEventListener("scroll", handleScroll);
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  
  return (
    ShowSidebarIf && (
      <Box id="content_wrapper" maxW="md" minW="md">
        <Heading as="h4" fontSize="lg" fontWeight="bold" mb="2">
          Chats
        </Heading>
        {/* <Divider/> */}
        <Chats user={user} />

        {/* <Divider/> */}
        {userDetails != null &&
          (followings ? (
            <>
              <Heading as="h4" fontSize="lg" fontWeight="bold" mt="4" mb="2">
                Following
              </Heading>
              <Following
                followings={followings}
                user={userDetails}
                fetchfollowChannelList={fetchfollowChannelList}
              />
            </>
          ) : (
            <Spinner color="#333" mt="2" />
          ))}
      </Box>
    )
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(RightSidebar));
