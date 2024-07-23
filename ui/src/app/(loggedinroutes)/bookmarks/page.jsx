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
  HStack,
  VStack,
  Avatar,
  IconButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { connect } from "react-redux";
import {
  fetchPostsBookmarks,
  fetchCommentsBookmarks,
  addRemoveBookmarks,
} from "@/redux/bookmarks/bookmarkAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import PostCard from "./postCard";
import Link from "next/link";
import { CiBookmark } from "react-icons/ci";

const Comment = ({ id,isBookmarked, singleComment, submitBookmark }) => (
  <Box w="100%" p={4} borderWidth="1px" borderRadius="md">
    <HStack spacing={4} position="relative">
      <Avatar name={singleComment.userId.username} />
      <Link href={`post/${singleComment.postId}`}>
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">{singleComment.userId.username}</Text>
          <Text fontSize="sm" color="gray.500">
            {singleComment.createdAt}
          </Text>
          <Box borderWidth="1px" borderRadius="md" boxShadow="lg" p="2">
            <Text>
              {'"'}
              {singleComment.excerpt}
              {'"'}
            </Text>
          </Box>
        </VStack>
      </Link>
      <Box position="absolute" top="0" right="0">
        <IconButton
          variant="ghost"
          colorScheme={!isBookmarked ? "gray" : "green"}
          aria-label="See menu"
          fontSize="20px"
          icon={
            !isBookmarked ? <CiBookmark /> : <BookmarkFilled />
          }
          onClick={() => submitBookmark("comment", id)}
        />
      </Box>
    </HStack>
    <HStack spacing={2}>
      <Text mt="3"></Text>
      <Text mt="3">{singleComment.commentText}</Text>
    </HStack>
  </Box>
);

const Bookmark = ({
  fetchPostsBookmarks,
  fetchCommentsBookmarks,
  bookmarkState,
  postBookmarks,
  commentsBookmarks,
  addRemoveBookmarks,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (tabIndex === 0) {
      fetchPostsBookmarks();
    } else {
      fetchCommentsBookmarks();
    }
  }, [tabIndex]);
  const submitPostBookmark = async (type, postId) => {
    try {
      await addRemoveBookmarks(type, postId);
      fetchPostsBookmarks();
    } catch (error) {}
  };
  const submitCommentBookmark = async (type, commentId) => {
    try {
      await addRemoveBookmarks(type, commentId);
      fetchCommentsBookmarks();
    } catch (error) {}
  };

  return (
    <Box>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Bookmark Posts</Tab>
          <Tab>Bookmark Comments</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box mt={2}>
              {bookmarkState.loading ? (
                <Spinner size="sm" color="#333" />
              ) : (
                postBookmarks?postBookmarks.map((post) => {
                  return (
                    <PostCard
                      key={post._id || crypto.randomUUID()}
                      post={post.postId}
                      submitBookmark={submitPostBookmark}
                    />
                  );
                }):<Text>No Bookmarked Posts</Text>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4}>
              {commentsBookmarks.length>0?commentsBookmarks.map(
                (comment) =>
                  comment.postCommentId && (
                    <Comment
                      key={comment._id}
                      id={comment.postCommentId._id}
                      isBookmarked={comment.isBookmarked}
                      singleComment={comment.postCommentId}
                      submitBookmark={submitCommentBookmark}
                    />
                  )
              ):<Text>No Bookmark Comments</Text>}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  bookmarkState: state.bookmark,
  postBookmarks: state.bookmark.postBookmarks,
  commentsBookmarks: state.bookmark.commentsBookmarks,
});

const mapDispatchToProps = {
  fetchPostsBookmarks,
  fetchCommentsBookmarks,
  addRemoveBookmarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Bookmark);
