"use client";
import React, { useEffect } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  Button,
  Flex,
  Input,
  Container,
  Heading,
  Image,
  IconButton,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { FiMoreHorizontal } from 'react-icons/fi';
import { CiBookmark } from "react-icons/ci";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";
import { connect } from "react-redux";
import {
  getCommentRepliesByCommentId,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
} from "../../../../redux/comments/commentAction";
import { formatDateTime } from "@/app/utils/DateUtils";
import getExcerpt from "@/app/utils/GetExcerpt";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
function SingleComment({
  comment,
  replies,
  getCommentRepliesByCommentId,
  id,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
  loading,
  commentHead,
  commentUsername,
  addRemoveBookmarks,
  setReplayCount,
  postId
}) {
  const [replayText, setReplayText] = React.useState("");
  React.useEffect(() => {
    getCommentRepliesByCommentId(id,postId);
  }, [getCommentRepliesByCommentId]);

  const handleChangeReplayText = (e) => {
    setReplayText(e.target.value);
  };
  const submitReplayText = (commentId, replayText) => {
    replayToPostComment(commentId, replayText,postId);
    setReplayText("");
  };

  const submitBookmark = async (type, commentId) => {
    const response = await addRemoveBookmarks(type, commentId);
    // const updatedData = { isBookmarked: response.data.isBookmarked };
    getCommentRepliesByCommentId(id,postId)
  };
  useEffect(() => {
    if(replies)
    setReplayCount(replies.length)
  }, [replies])
  
  return (
    <Box px={{ base: 0 }}>
      {comment && (
        <>
          <Box bg="lightgray" p="4" maxW="2xl">
            <Heading as="h6" size="sm">
              {" "}
              Replies to {comment.userId.username}
            </Heading>
          </Box>
          <Box textAlign="right" maxW="2xl" mt={2} px={4}>
            <Textarea
              type="replay"
              placeholder="Enter Reply..."
              name="replytext"
              value={replayText}
              onChange={handleChangeReplayText}
            />
            <Button
              onClick={() => {
                submitReplayText(comment._id, replayText);
              }}
              size="md"
              colorScheme="green"
            >
              Post{" "}
              {replayText != "" && loading ? (
                <Spinner size="sm" color="white" />
              ) : (
                ""
              )}
            </Button>
          </Box>
          {replies.map((replay) => (
            <Box key={replay._id} maxW="2xl" px={4} pb={4}>
              <HStack spacing={4} position="relative" mt={2}>
                <Avatar name={replay.userId.channelName} src={replay.userId.profileImageUrl}/>
                <VStack align="start" spacing={1}>
                  <Text fontSize="md" fontWeight="bold">
                    {replay.userId.channelName}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatDateTime(replay.createdAt)}
                  </Text>
                </VStack>
                <Box position="absolute" top={0} right="0">
                <IconButton
                  variant="ghost"
                  color="gray.400"
                  aria-label="See menu"
                  fontSize='lg'
                  icon={<FiMoreHorizontal/>}
                />
                  <IconButton
                    variant="ghost"
                    color={!replay.isBookmarked ? "gray" : "green.500"}
                    aria-label="See menu"
                    fontSize="lg"
                    icon={!replay.isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
                    onClick={() => submitBookmark("comment", replay._id)}
                  />
                </Box>
              </HStack>
              
              <HStack
                spacing={4}
                w="100%"
                ml="14%"
                mt={4}
                borderLeftWidth="4px"
                borderColor="#0F4CAE"
              >
                <VStack align="start" spacing={1} ml={4}>
                  <Text fontSize="md" fontWeight="bold">
                    {commentUsername}
                  </Text>
                  <Text fontSize="md" color="gray.500">
                    {getExcerpt(commentHead, 34)}
                  </Text>
                </VStack>
              </HStack>
              <VStack align="center" spacing={2} mt="2" ml="14%">
                <Box p="4" bg="lightblue" borderRadius="md" w='100%'>
                  <Text fontSize="md">{replay.commentReply}</Text>
                </Box>
                <HStack justifyContent="flex-end" width="80%" spacing={4}>
                  <Flex gap={4}>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={
                        <PiArrowFatUpLight
                          colorScheme="textlight"
                          fontSize="28px"
                        />
                      }
                      aria-label="Upvote"
                      onClick={() =>
                        updateCommentReplayUpvote(comment._id, replay._id)
                      }
                    >
                      <Text color={"green.500"}>{replay.upvoteCount}</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={
                        <PiArrowFatDownLight
                          colorScheme="textlight"
                          fontSize="28px"
                        />
                      }
                      aria-label="Upvote"
                      onClick={() =>
                        updateCommentReplayDownvote(comment._id, replay._id)
                      }
                    >
                      <Text color={"red"}>{replay.downvoteCount}</Text>
                    </Button>
                  </Flex>
                </HStack>
              </VStack>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}

const mapStateToProps = (state) => ({
  comment:
    state.comment.singleCommentReplies &&
    state.comment.singleCommentReplies.comment,
  replies:
    state.comment.singleCommentReplies &&
    state.comment.singleCommentReplies.replies,
  loading: state.comment.loading,
});

const mapDispatchToProps = {
  getCommentRepliesByCommentId,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
  addRemoveBookmarks
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleComment);
