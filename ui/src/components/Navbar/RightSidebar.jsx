import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { fetchfollowChannelList } from "@/redux/channel/channelActions";
import { fetchUser } from "@/redux/profile/actions";
import { Box, Heading, Flex, Spinner, Text } from "@chakra-ui/react";
import Following from "@/app/(loggedinroutes)/home/following";
import Chats from "@/app/(loggedinroutes)/chats";
import { usePathname } from "next/navigation";
import useDeviceType from "@/components/useDeviceType";
import { RightSidebarRoutes } from "@/routes";
import Link from "next/link";

function RightSidebar({
  userDetails,
  user,
  fetchUser,
  userFollowings,
  fetchfollowChannelList,
}) {
  const path = usePathname();
  const deviceType = useDeviceType();
  const offsetRef = useRef(0); // Use ref to persist offset value
  const lastScrollTopRef = useRef(0); // Use ref for lastScrollTop
  
  const ShowSidebarIf =
    RightSidebarRoutes.find((route) => path.startsWith(route)) &&
    deviceType == "desktop";

  useEffect(() => {
    if (ShowSidebarIf && user) {
      fetchfollowChannelList();
      fetchUser(user.id);
    }
  }, [ShowSidebarIf, user]);

  // Reset sidebar scroll position on route change
  useEffect(() => {
    const sidebarContent = document.getElementById("content_wrapper");
    if (sidebarContent && ShowSidebarIf) {
      // Reset the offset and transform
      offsetRef.current = 0;
      sidebarContent.style.transform = 'translateY(0px)';
      sidebarContent.style.position = 'fixed';
      lastScrollTopRef.current = 0;
    }
  }, [path, ShowSidebarIf]); // Reset when route changes

  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const sidebarContent = document.getElementById("content_wrapper");
    const mainContainer = document.getElementById("main_container");

    if (!sidebar || !sidebarContent || !mainContainer || !ShowSidebarIf) return;

    // Enable smooth scrolling
    sidebarContent.style.transition = "transform 0.3s ease-out";

    const handleScroll = () => {
      // Check if elements still exist during scroll
      const currentSidebar = document.getElementById("sidebar");
      const currentSidebarContent = document.getElementById("content_wrapper");
      const currentMainContainer = document.getElementById("main_container");

      if (!currentSidebar || !currentSidebarContent || !currentMainContainer) {
        return;
      }

      const scrollTop = window.scrollY;
      const viewportH = window.innerHeight;
      const contentH = currentSidebarContent.getBoundingClientRect().height;
      const mainContainerH = currentMainContainer.getBoundingClientRect().height;
      const sidebarTop = currentSidebar.getBoundingClientRect().top + window.scrollY;

      // Only apply custom scroll behavior if main container is tall enough to require scrolling
      if (mainContainerH > viewportH && contentH < mainContainerH) {
        if (scrollTop > lastScrollTopRef.current) {
          // Scrolling Down: Move sidebar content up
          offsetRef.current = Math.max(
            -(contentH - viewportH + sidebarTop),
            offsetRef.current - (scrollTop - lastScrollTopRef.current)
          );
        } else {
          // Scrolling Up: Move sidebar content down smoothly
          offsetRef.current = Math.min(0, offsetRef.current + (lastScrollTopRef.current - scrollTop));
        }

        currentSidebarContent.style.transform = `translateY(${offsetRef.current}px)`;
        currentSidebarContent.style.position = "fixed";
      } else {
        // Disable custom functionality - allow normal scroll behavior
        currentSidebarContent.style.transform = '';
        currentSidebarContent.style.position = '';
        offsetRef.current = 0;
      }

      lastScrollTopRef.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ShowSidebarIf]); // Add ShowSidebarIf as dependency

  return (
    ShowSidebarIf && (
      <Box id="content_wrapper" maxW="md" minW="md">
        <Heading as="h4" fontSize="lg" fontWeight="bold" mb="2">
          Chats
        </Heading>
        {/* <Divider/> */}
        <Chats user={user} />

        {/* <Divider/> */}
        {userDetails && userFollowings && userDetails != null &&
          (userFollowings ? (
            <>
              <Heading as="h4" fontSize="lg" fontWeight="bold" mt="4" mb="2">
                Following
              </Heading>
              <Following
                followings={userFollowings}
                user={userDetails}
                fetchfollowChannelList={fetchfollowChannelList}
              />
            </>
          ) : (
            <Spinner color="#333" mt="2" />
          ))}
        <Flex
          flexDir="column"
          width="100%"
          paddingTop="20px"
          paddingBottom="150px"
          justifyContent="space-between"
        >
          {/* Top Row - Two Links */}
          <Flex gap={4}>
            <Link href="/policies/terms-of-service">
              <Text
                color="blue.500"
                _hover={{ textDecoration: "underline", color: "blue.700" }}
              >
                Terms of Service
              </Text>
            </Link>
            <Link href="/policies/legal-disclaimer" color="blue:500">
              <Text
                color="blue.500"
                _hover={{ textDecoration: "underline", color: "blue.700" }}
              >
                Legal Disclaimer
              </Text>
            </Link>
          </Flex>

          {/* Bottom Row - Privacy Policy (Left) & Copyright (Right) */}
          <Flex gap={4} alignItems="center">
            <Link href="/policies/privacy-policy" color="blue:500">
              <Text
                color="blue.500"
                _hover={{ textDecoration: "underline", color: "blue.700" }}
              >
                Privacy Policy
              </Text>
            </Link>
            <Text>© 2025 VersoView.</Text>
          </Flex>
        </Flex>
      </Box>
    )
  );
}

const mapStateToProps = (state) => ({
  postsState: state.post,
  loading: state.post.loading,
  posts: state.post.posts,
  recentPosts: state.post.recentPosts,
  userFollowings: state.channel.userFollowings,
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