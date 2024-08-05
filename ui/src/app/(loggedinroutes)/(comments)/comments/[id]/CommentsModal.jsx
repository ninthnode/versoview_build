import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  IconButton,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Slide,
} from "@chakra-ui/react";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import Link from "next/link";
import { CiBookmark } from "react-icons/ci";
import SingleComment from "../../single-comment/[id]/page";

const Comment = ({
  _id,
  isBookmarked,
  submitBookmark,
  trueCount,
  falseCount,
  userId,
  excerpt,
  createdAt,
  commentText,
  upvoteComment,
  downvoteComment,
  setshowReply,
  showReply
}) => (
  <Box w="100%" p={4} borderWidth="1px" borderRadius="md">
    <HStack spacing={4} position="relative">
      <Avatar name={userId.username} />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold">{userId.username}</Text>
        <Text fontSize="sm" color="gray.500">
          {createdAt}
        </Text>
        {excerpt && (
          <Box borderWidth="1px" borderRadius="md" boxShadow="lg" p="2">
            <Text>
              {'"'}
              {excerpt}
              {'"'}
            </Text>
          </Box>
        )}
      </VStack>
      <Box position="absolute" top="0" right="0">
        <IconButton
          variant="ghost"
          colorScheme={!isBookmarked ? "gray" : "green"}
          aria-label="See menu"
          fontSize="20px"
          icon={!isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
          onClick={() => submitBookmark("comment", _id)}
        />
      </Box>
    </HStack>
    <HStack spacing={2}>
      <Text mt="3"></Text>
      <Text mt="3">{commentText}</Text>
    </HStack>

    <HStack justifyContent="space-between" spacing={4}>
      <Box>
          <Button size="sm" mt="4" onClick={() => showReply==_id?setshowReply(''):setshowReply(_id)}>
            {showReply==_id?'Hide Replies':'View Replies'}
          </Button>
      </Box>
      <Flex gap={4}>
        <Button
          size="sm"
          leftIcon={<BiUpvote />}
          aria-label="Upvote"
          onClick={() => upvoteComment(_id)}
        >
          {trueCount}
        </Button>
        <Button
          size="sm"
          leftIcon={<BiDownvote />}
          aria-label="Upvote"
          onClick={() => downvoteComment(_id)}
        >
          {falseCount}
        </Button>
      </Flex>
    </HStack>
{showReply==_id&&
  <SingleComment id={_id} />}

  </Box>
);

const CommentsModal = ({
  commentList,
  downvoteComment,
  upvoteComment,
  submitBookmark,
  isOpenCommentModal,
  onToggleCommentModal,
}) => {

  const [showReply, setshowReply] = useState('')
  return(
    <>
    {isOpenCommentModal && (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.600"
        zIndex="1"
      ></Box>
    )}

    <Slide direction="bottom" in={isOpenCommentModal} style={{ zIndex: 1 }}>
      <Box
        ml={{ base: 0, md: "16rem" }}
        mr={{ base: 0, md: 5 }}
        mt={{ base: 4, md: 4 }}
      >
        <Flex w={{ base: "100%", lg: "2xl", md: "70%" }}>
          <Box mt="4" bg="white" rounded="md" shadow="md" p="2" w="100%">
            <Flex justifyContent="flex-end" p="0" w="100%" mb='2'>
              <Button onClick={onToggleCommentModal}>close</Button>
            </Flex>
            <Box h="90vh" overflowY="scroll">
              <VStack spacing={4} mt={10} mb={4} p="2">
                {commentList.length ? (
                  commentList.map((comment) => (
                    <Comment
                    setshowReply={setshowReply}
                    showReply={showReply}
                      key={comment._id}
                      {...comment}
                      upvoteComment={upvoteComment}
                      downvoteComment={downvoteComment}
                      submitBookmark={submitBookmark}
                    />
                  ))
                ) : (
                  <Text>No Comments</Text>
                )}
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Slide>
  </>
  )
}

export default CommentsModal;
