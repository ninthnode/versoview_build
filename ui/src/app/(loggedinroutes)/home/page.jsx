"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { connect } from "react-redux";
import {
  fetchPosts,
  fetchRecentlyViewedPosts,
} from "@/redux/posts/postActions";
import { fetchfollowChannelList } from "@/redux/channel/channelActions";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import PostCard from "./postCard";
import StatusSlider from "./StatusSlider";
import Following from "./following";
import { fetchUser } from "@/redux/profile/actions";
import PostCardShimmer from "../../../components/posts/PostCardShimmer";
import useDeviceType from "@/components/useDeviceType";
const Home = ({
  postsState,
  loading,
  posts,
  recentPosts,
  fetchPosts,
  fetchRecentlyViewedPosts,
  addRemoveBookmarks,
  fetchfollowChannelList,
  followings,
  fetchUser,
  user,
  authVerified,
  userDetails,
  pagination
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [postList, setPostList] = useState([]);
  const [recentPostList, setRecentPostList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef(null);
  const deviceType = useDeviceType();

  useEffect(() => {
    if(authVerified){
      if (tabIndex === 0) {
        setCurrentPage(1);
        fetchPosts(1, 10);
      } else if (tabIndex === 1) {
        fetchRecentlyViewedPosts();
      } else if (tabIndex === 2) {
        fetchfollowChannelList();
         fetchUser(user.id);
      }
    }
  }, [tabIndex,authVerified]);

  useEffect(() => {
    if (posts.length > 0) setPostList(posts);
  }, [posts]);
  useEffect(() => {
    if (recentPosts.length > 0) setRecentPostList(recentPosts);
  }, [recentPosts]);

  // Load more posts when user scrolls to bottom
  const loadMorePosts = useCallback(async () => {
    if (isFetchingMore || !pagination?.hasMore || loading) return;

    setIsFetchingMore(true);
    const nextPage = currentPage + 1;
    await fetchPosts(nextPage, 10);
    setCurrentPage(nextPage);
    setIsFetchingMore(false);
  }, [currentPage, isFetchingMore, pagination, loading, fetchPosts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (tabIndex !== 0) return; // Only for Latest tab

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination?.hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [tabIndex, pagination, loading, loadMorePosts]);

  const submitBookmarkPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    const updatedData = { isBookmarked: res.data.isBookmarked };
    setPostList((prevItems) =>
      prevItems.map((item) =>
        item._id === res.data.postId ? { ...item, ...updatedData } : item
      )
    );
  };
  const submitBookmarkRecentPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    const updatedData = { isBookmarked: res.data.isBookmarked };
    setRecentPostList((prevItems) =>
      prevItems.map((item) =>
        item._id === res.data.postId ? { ...item, ...updatedData } : item
      )
    );
  };
  return (
    <Box>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList  px={4} gap={2} h="3rem" borderColor='lightgray'>
          <Tab pl="0">Latest</Tab>
          <Tab pl="1" isDisabled={!user}>Recently viewed</Tab>
          {deviceType!='desktop'&&
          <Tab pl="1" isDisabled={!user}>Following</Tab>}
        </TabList>
        <TabPanels p="0">
          <TabPanel p="0">
            <Box mt='2'>
              {<StatusSlider />}
              {loading && postList.length === 0 || !authVerified ? (
                <PostCardShimmer />
              ) : (
                <>
                  {postList.map?.((post,i) => (
                    <Box key={post._id} mt={i>0?'4':'0'}>
                      <PostCard
                        showBookmarkButton={user?true:false}
                        key={post._id || crypto.randomUUID()}
                        post={post}
                        submitBookmark={submitBookmarkPost}
                      />
                      {/* <Divider /> */}
                    </Box>
                  ))}
                  {/* Infinite scroll trigger */}
                  <Box ref={observerTarget} py={4}>
                    {isFetchingMore && (
                      <Center>
                        <Spinner size="md" color="blue.500" />
                      </Center>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel p="0">
          <Box mt='2'>
                {recentPostList && <StatusSlider />}
            {loading ? (
              <PostCardShimmer />
            ) : (
              <>
                {tabIndex === 1 && recentPostList.length == 0 ? (
                  <Text>No Post Viewed!</Text>
                ) : (
                  recentPostList.map((post) => (
                    <PostCard
                    showBookmarkButton={user?true:false}
                      key={post.id}
                      post={post}
                      submitBookmark={submitBookmarkRecentPost}
                    />
                  ))
                )}
              </>
            )}
            </Box>
          </TabPanel>
          <TabPanel p='0'>
          <Box mt='2'>
            {userDetails&&followings.data && deviceType!='desktop' && (
              <Following followings={followings} user={userDetails} fetchfollowChannelList={fetchfollowChannelList}/>
            )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  postsState: state.post,
  loading: state.post.loading,
  posts: state.post.posts,
  recentPosts: state.post.recentPosts,
  followings: state.channel.followings,
  user: state.auth.user?.user,
  authVerified: state.auth.userVerified,
  userDetails: state.profile.user,
  pagination: state.post.pagination
});

const mapDispatchToProps = {
  fetchPosts,
  fetchRecentlyViewedPosts,
  fetchfollowChannelList,
  addRemoveBookmarks,
  fetchUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
