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
  Divider,
} from "@chakra-ui/react";
import { connect } from "react-redux";
import {
  fetchBookmarks,
  addRemoveBookmarks,
} from "@/redux/bookmarks/bookmarkAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import Link from "next/link";
import { CiBookmark } from "react-icons/ci";
import PostCard from "@/app/(loggedinroutes)/home/postCard";

const Comment = ({ id, isBookmarked, singleComment,postId, submitBookmark,commentText }) => (
  <Box my='4'>
  <Box p={2} bg='#fff'>
    <PostCard
      key={postId._id || crypto.randomUUID()}
      post={postId}
      showBookmarkButton={false}
    />
  </Box>
  <Divider/>
    <Box
      maxW="2xl"
      p={4}
      position="relative"
      bg="#fff"
      mt="0"
    >
      <Link href={`comments/${postId._id}`}>
        <HStack spacing={4}>
          <Avatar name={singleComment.userId.username} />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{singleComment.userId.username}</Text>
            <Text fontSize="sm" color="gray.500">
              {singleComment.createdAt}
            </Text>
            {singleComment.excerpt && (
              <Box borderWidth="1px" borderRadius="md" boxShadow="lg" p="2">
                <Text>
                  {'"'}
                  {singleComment.excerpt}
                  {'"'}
                </Text>
              </Box>
            )}
          </VStack>
        </HStack>
      </Link>
      <Box position="absolute" top="0" right="0">
        <IconButton
          variant="ghost"
          colorScheme={!isBookmarked ? "gray" : "green"}
          aria-label="See menu"
          fontSize="20px"
          icon={!isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
          onClick={() => submitBookmark("comment", id)}
        />
      </Box>
      <HStack spacing={2}>
        <Text mt="3"></Text>
        <Text mt="3">{commentText}</Text>
      </HStack>
    </Box>
  </Box>
);

const Bookmark = ({
  fetchBookmarks,
  bookmarkState,
  postBookmarks,
  commentsBookmarks,
  addRemoveBookmarks,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetchBookmarks();
  }, []);
  const submitPostBookmark = async (type, postId) => {
    try {
      await addRemoveBookmarks(type, postId);
      fetchBookmarks();
    } catch (error) {}
  };
  const submitCommentBookmark = async (type, commentId) => {
    try {
      await addRemoveBookmarks(type, commentId);
      fetchBookmarks();
    } catch (error) {}
  };

  return (
    <Box mb="60px">
      <Box
        mt={4}
        maxW="2xl"
        bg="lightgray"
        borderWidth="1px"
        borderRadius="md"
      >
        {postBookmarks.length > 0 ? (
          bookmarkState.loading ? (
            <Spinner size="sm" color="#333" />
          ) : (
            postBookmarks.map((post) => {
              if (post.postId) {
                return (
                  <Box p={2} bg='#fff' key={post.postId._id}>
                  <PostCard
                    key={post._id || crypto.randomUUID()}
                    post={post.postId}
                    showBookmark={true}
                    submitBookmark={submitPostBookmark}
                  />
                  </Box>
                );
              } else if (
                post.postCommentId &&
                post.postCommentId.postCommentId
              ) {
                return (
                  <Comment
                    key={post._id}
                    id={post.postCommentId._id}
                    postId={post.postCommentId.postCommentId.postId}
                    isBookmarked={post.isBookmarked}
                    singleComment={post.postCommentId}
                    submitBookmark={submitCommentBookmark}
                    commentText={post.postCommentId.commentReply}
                  />
                );
              } else if (post.postCommentId) {
                return (
                  <Comment
                    key={post._id}
                    id={post.postCommentId._id}
                    postId={post.postCommentId.postId}
                    isBookmarked={post.isBookmarked}
                    singleComment={post.postCommentId}
                    submitBookmark={submitCommentBookmark}
                    commentText={post.postCommentId.commentText}
                  />
                );
              } else {
                return null;
              }
            })
          )
        ) : (
          <Text color="gray.500">No Bookmarks Available</Text>
        )}
      </Box>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  bookmarkState: state.bookmark,
  postBookmarks: state.bookmark.postBookmarks,
});

const mapDispatchToProps = {
  fetchBookmarks,
  addRemoveBookmarks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Bookmark);
