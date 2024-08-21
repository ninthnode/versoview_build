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
import { fetchUser } from "@/redux/profile/actions";

const Home = ({
  postsState,
  posts,
  recentPosts,
  fetchPosts,
  fetchRecentlyViewedPosts,
  addRemoveBookmarks,
  fetchfollowChannelList,
  followings,
  fetchUser,
  user,
  userDetails
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
       fetchUser(user.id);
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
        <TabList gap={2} h="3rem" borderColor='lightgray'>
          <Tab pl="0">Latest</Tab>
          <Tab pl="1" isDisabled={!user}>Recently viewed</Tab>
          <Tab pl="1" isDisabled={!user}>Following</Tab>
        </TabList>

        <TabPanels p="0">
          <TabPanel p="0">
            <Box mt='2'>
              {postsState.loading ? (
                <Spinner size="sm" color="#333" />
              ) : (
                <>
                  {<StatusSlider />}
                  {postList.map?.((post) => (
                    <Box key={post._id}>
                      <PostCard
                        key={post._id || crypto.randomUUID()}
                        post={post}
                        submitBookmark={submitBookmarkPost}
                      />
                      <Divider />
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel p="0">
          <Box mt='2'>
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
            </Box>
          </TabPanel>
          <TabPanel p='0'>
          <Box mt='2'>
            {userDetails&&followings.data && (
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
  posts: state.post.posts,
  recentPosts: state.post.recentPosts,
  followings: state.channel.followings,
  user: state.auth.user?.user,
  userDetails: state.profile.user
});

const mapDispatchToProps = {
  fetchPosts,
  fetchRecentlyViewedPosts,
  fetchfollowChannelList,
  addRemoveBookmarks,
  fetchUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
