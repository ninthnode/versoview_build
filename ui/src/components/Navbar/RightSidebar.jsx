import React, { useEffect } from "react";
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
                as="a"
                color="blue.500"
                _hover={{ textDecoration: "underline", color: "blue.700" }}
              >
                Terms of Service
              </Text>
            </Link>
            <Link href="/policies/legal-disclaimer" color="blue:500">
              <Text
                as="a"
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
                as="a"
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
