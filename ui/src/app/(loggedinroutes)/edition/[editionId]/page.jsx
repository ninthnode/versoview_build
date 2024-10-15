"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
} from "@chakra-ui/react";
import { connect } from "react-redux";
import { getEditionById } from "@/redux/publish/publishActions";
import EditionCard from "@/components/channels/EditionCard";
import PostCard from "@/app/(loggedinroutes)/home/postCard";

const Home = ({
  getEditionById,
  params,
  user,
  singleEdition,
  singleEditionPosts,
}) => {
  const [postList, setPostList] = useState([]);
  useEffect(() => {
    if (user) {
      getEditionById(params.editionId);
    }
  }, [user]);

  useEffect(() => {
    if (singleEditionPosts.length > 0) setPostList(singleEditionPosts);
  }, [singleEditionPosts]);

  const submitBookmarkPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    const updatedData = { isBookmarked: res.data.isBookmarked };
    setPostList((prevItems) =>
      prevItems.map((item) =>
        item._id === res.data.postId ? { ...item, ...updatedData } : item
      )
    );
  };

  return (
    <Box>
      {singleEdition && singleEdition.channelData && (
        <EditionCard
          key={1}
          edition={singleEdition}
          channel={singleEdition.channelData}
        />
      )}
      {postList.map?.((post) => (
        <Box key={post._id}>
          <PostCard
            showBookmarkButton={user ? true : false}
            key={post._id || crypto.randomUUID()}
            post={post}
            submitBookmark={submitBookmarkPost}
          />
          <Divider />
        </Box>
      ))}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  loading: state.post.loading,
  singleEdition: state.publish.singleEdition,
  singleEditionPosts: state.publish.singleEditionPosts,
  user: state.auth.user?.user,
});

const mapDispatchToProps = {
  getEditionById,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
