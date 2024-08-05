"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Text,
  Divider
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

const Home = ({
  postsState,
  posts,
  recentPosts,
  fetchPosts,
  fetchRecentlyViewedPosts,
  addRemoveBookmarks,
  fetchfollowChannelList,
  followings,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [postList, setPostList] = useState([]);
  const [recentPostList, setRecentPostList] = useState([]);

  useEffect(() => {
    if (tabIndex === 0) {
      fetchPosts();
    } else if (tabIndex === 1) {
      fetchRecentlyViewedPosts();
    } else if (tabIndex === 2) {
      fetchfollowChannelList();
    }
  }, [tabIndex]);

  useEffect(() => {
    if (posts.length > 0) setPostList(posts);
  }, [posts]);
  useEffect(() => {
    if (recentPosts.length > 0) setRecentPostList(recentPosts);
  }, [recentPosts]);

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
    <Box px={4}>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList gap={2} h="3rem">
          <Tab pl="0">Latest</Tab>
          <Tab pl="1">Recently viewed</Tab>
          <Tab pl="1">Following</Tab>
        </TabList>

        <TabPanels p="0">
          <TabPanel p="0">
            <Box mt={2}>
              {postsState.loading ? (
                <Spinner size="sm" color="#333" />
              ) : (
                <>
                  {posts.length && <StatusSlider />}
                  {postList.map?.((post) => (
                    <>
                      <PostCard
                        key={post._id || crypto.randomUUID()}
                        post={post}
                        submitBookmark={submitBookmarkPost}
                      />
                      <Divider />
                    </>
                  ))}
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            {postsState.loading ? (
              <Spinner size="sm" color="#333" />
            ) : (
              <>
                {recentPostList && <StatusSlider />}
                {tabIndex === 1 && recentPostList.length == 0 ? (
                  <Text>No Post Viewed!</Text>
                ) : (
                  recentPostList.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      submitBookmark={submitBookmarkRecentPost}
                    />
                  ))
                )}
              </>
            )}
          </TabPanel>
          <TabPanel>
            {followings.data && followings.data.length > 0 && (
              <Following followings={followings} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  postsState: state.post,
  posts: state.post.posts,
  recentPosts: state.post.recentPosts,
  followings: state.channel.followings,
});

const mapDispatchToProps = {
  fetchPosts,
  fetchRecentlyViewedPosts,
  fetchfollowChannelList,
  addRemoveBookmarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
