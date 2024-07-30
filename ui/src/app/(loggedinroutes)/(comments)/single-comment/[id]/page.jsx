"use client";
import React from "react";
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
  Link,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { FaRegComment, FaTelegramPlane } from "react-icons/fa";
import { connect } from "react-redux";
import {
  getCommentRepliesByCommentId,
  updateCommentUpvote,
  updateCommentDownvote,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
} from "../../../../../redux/comments/commentAction";

function SingleComment({
  comment,
  replies,
  getCommentRepliesByCommentId,
  params,
  updateCommentUpvote,
  updateCommentDownvote,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
  loading,
}) {
  const [replayText, setReplayText] = React.useState("");
  React.useEffect(() => {
    getCommentRepliesByCommentId(params.id);
  }, [getCommentRepliesByCommentId]);

  const handleChangeReplayText = (e) => {
    setReplayText(e.target.value);
  };
  const submitReplayText = (commentId, replayText) => {
    replayToPostComment(commentId, replayText);
    setReplayText("");
  };
  return (
    <Box px={{ base: 0, sm: "20px" }}>
      {comment && (
        <>
          <Flex alignItems="center" ml="4" mb={4}>
            <Link href={`/comments/${comment._id}`}>
              <Image m="0" src={"/assets/back.svg"} mr={2} />
            </Link>
          </Flex>
          <Box
            maxW="2xl"
            p={4}
            bg="bglight"
            borderWidth="1px"
            borderRadius="md"
            mb="4"
          >
            <HStack spacing={4}>
              <Avatar name={comment.userId.username} />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">{comment.userId.username}</Text>
                <Text fontSize="sm" color="gray.500">
                  {comment.createdAt}
                </Text>
                {comment.excerpt && (
                  <Box
                    bg="#fff"
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="lg"
                    p="2"
                  >
                    <Text>
                      {'"'}
                      {comment.excerpt}
                      {'"'}
                    </Text>
                  </Box>
                )}
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <Text my="2">{comment.commentText}</Text>
            </HStack>

            <HStack justifyContent="space-between" spacing={4}>
              <Flex gap={4}>
                <Button
                  size="sm"
                  leftIcon={<BiUpvote />}
                  aria-label="Upvote"
                  onClick={() => {
                    updateCommentUpvote(comment._id);
                    getCommentRepliesByCommentId(comment._id);
                  }}
                >
                  {comment.upvoteCount}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<BiDownvote />}
                  aria-label="Upvote"
                  onClick={() => {
                    updateCommentDownvote(comment._id);
                    getCommentRepliesByCommentId(comment._id);
                  }}
                >
                  {comment.downvoteCount}
                </Button>
                <Button size="sm" leftIcon={<FaRegComment />} variant="link">
                  Reply
                </Button>
              </Flex>
            </HStack>
          </Box>
          <Box my="4" textAlign="right" maxW="2xl">
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
              rightIcon={<FaTelegramPlane />}
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
          <Box bg="lightgray" p="4" borderRadius="md" maxW="2xl">
            <Heading as="h6" size="sm">
              {" "}
              Replies to {comment.userId.username}
            </Heading>
          </Box>
          {replies.map((replay) => (
            <Box
              key={replay._id}
              maxW="2xl"
              p={4}
              borderWidth="1px"
              borderRadius="md"
            >
              <HStack spacing={4}>
                <Avatar name={replay.userId.channelName} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{replay.userId.username}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {replay.createdAt}
                  </Text>
                </VStack>
              </HStack>
              <VStack align="center" spacing={2} mt="2">
                <Box p="4" bg="lightblue" borderRadius="md" w={"80%"}>
                  <Text>{replay.commentReply}</Text>
                </Box>
                <HStack justifyContent="flex-end" width="80%" spacing={4}>
                  <Flex gap={4}>
                    <Button
                      size="sm"
                      leftIcon={<BiUpvote />}
                      aria-label="Upvote"
                      onClick={() =>
                        updateCommentReplayUpvote(comment._id, replay._id)
                      }
                    >
                      {replay.upvoteCount}
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<BiDownvote />}
                      aria-label="Upvote"
                      onClick={() =>
                        updateCommentReplayDownvote(comment._id, replay._id)
                      }
                    >
                      {replay.downvoteCount}
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
  updateCommentUpvote,
  updateCommentDownvote,
  updateCommentReplayUpvote,
  updateCommentReplayDownvote,
  replayToPostComment,
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleComment);
