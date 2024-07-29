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
  Text
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
import useSWR from "swr";
import get from "@/app/utils/get";

const Home = ({
  postsState,
  posts,
  recentPosts,
  fetchPosts,
  fetchRecentlyViewedPosts,
  addRemoveBookmarks,
}) => {
  const {
    data: followedChannels = [],
    // isLoading: followingLoading,
    // mutate,
  } = useSWR("channel/followChannelList", (k) =>
    get(k, true).then((r) =>
      r.data
        .map((i) => ({ channelId: i.channelId._id }))
        .filter((i) => i.pinned)
    )
  );

  const pinnedChannels = useMemo(
    () => followedChannels.filter((i) => i.pinned),
    [followedChannels]
  );

  const [tabIndex, setTabIndex] = useState(0);
  const [postList, setPostList] = useState([]);
  const [recentPostList, setRecentPostList] = useState([]);

  useEffect(() => {
    if (tabIndex === 0) {
      fetchPosts(); 
    } else {
      fetchRecentlyViewedPosts();
    }
  }, [tabIndex, fetchPosts, fetchRecentlyViewedPosts]);

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

  const pinnedPosts = useMemo(
    () =>
      postList.filter(
        (p) =>
          pinnedChannels.length &&
          pinnedChannels.map((c) => c._id).includes(p.channelId._id)
      ),
    [pinnedChannels, postList]
  );

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
                  {postList
                    ?.toSorted((a, b) =>
                      pinnedPosts.includes(a) && !pinnedPosts.includes(b)
                        ? -1
                        : 1
                    )
                    ?.map?.((post) => (
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
                {tabIndex === 1 &&
                  recentPostList.length == 0 ? <Text>No Post Viewed!</Text>:
                  recentPostList.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
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
