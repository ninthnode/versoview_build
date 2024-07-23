"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from "@chakra-ui/react";
import { connect } from "react-redux";
import {
  fetchPosts,
  fetchRecentlyViewedPosts,
} from "@/redux/posts/postActions";
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
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [postList, setPostList] = useState([]);
  const [recentPostList, setRecentPostList] = useState([]);

  useEffect(() => {
    if (tabIndex === 0) {
      fetchPosts();
    } else {
      fetchRecentlyViewedPosts();
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
    <Box>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Latest</Tab>
          <Tab>Recently viewed</Tab>
          <Tab>Following</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box mt={2}>
              {postsState.loading ? (
                <Spinner size="sm" color="#333" />
              ) : (
                <>
                  {posts.length && <StatusSlider />}
                  {postList &&
                    postList.map((post) => (
                      <PostCard
                        key={post._id || crypto.randomUUID()}
                        post={post}
                        submitBookmark={submitBookmarkPost}
                      />
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
                {tabIndex == 1 &&
                  recentPostList.length > 0 &&
                  recentPostList.map((post) => (
                    <PostCard key={post.id} post={post} 
                      submitBookmark={submitBookmarkRecentPost}
                    />
                  ))}
              </>
            )}
          </TabPanel>
          <TabPanel>
            <Following />
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
});

const mapDispatchToProps = {
  fetchPosts,
  fetchRecentlyViewedPosts,
  addRemoveBookmarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
