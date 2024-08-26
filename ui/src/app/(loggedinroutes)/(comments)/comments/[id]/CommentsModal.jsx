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
  Heading,
  Slide,
  Divider,
} from "@chakra-ui/react";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";
import { BsChat } from "react-icons/bs";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { CiBookmark } from "react-icons/ci";
import SingleComment from "../../single-comment/page";
import { IoClose } from "react-icons/io5";
import getExcerpt from "@/app/utils/GetExcerpt";
import { formatDateTime } from "@/app/utils/DateUtils";
import { FiMoreHorizontal } from 'react-icons/fi';

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
  showReply,
}) => {
  const [replayCount, setReplayCount] = useState(0);

  return(
  <Box w="100%" mb={4} bg="#fff">
    <HStack align="start" spacing={4} position="relative" px={4} pt={6}>
      <Avatar size='md' name={userId.channelName} src={userId.profileImageUrl} />
      <VStack align="start" spacing={1}>
        <Text fontSize='md' fontWeight="bold">{userId.channelName}</Text>
        <Text fontSize="sm" color="gray.500">
          {formatDateTime(createdAt)}
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
      <Box position="absolute" top={4} right="0">
      <IconButton
        variant="ghost"
        color="gray.400"
        aria-label="See menu"
        fontSize='25px'
        icon={<FiMoreHorizontal/>}
      />
        <IconButton
          variant="ghost"
          color={!isBookmarked ? "gray" : "green.500"}
          aria-label="See menu"
          fontSize="lg"
          icon={!isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
          onClick={() => submitBookmark("comment", _id)}
        />
      </Box>
    </HStack>
    <HStack spacing={2} px={4} py={2}>
      <Text mt="3" fontSize='md'>{commentText}</Text>
    </HStack>

    <HStack justifyContent="space-between" spacing={2} px={4} pb={4}>
      <Box>
        <Button
          size="sm"
          mt="4"
          p='0'
          variant="ghost"
          onClick={() =>
            showReply == _id ? setshowReply("") : setshowReply(_id)
          }
        >
          {showReply == _id ? "Hide Replies" : "View Replies"}
        </Button>
      </Box>
      <Flex gap={2} w='240px' alignItems='center'>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={
            <PiArrowFatUpLight colorScheme="textlight" fontSize="28px" />
          }
          aria-label="Upvote"
          onClick={() => upvoteComment(_id)}
        >
          <Text color={"green.500"}>{trueCount}</Text>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={
            <PiArrowFatDownLight colorScheme="textlight" fontSize="28px" />
          }
          aria-label="Upvote"
          onClick={() => downvoteComment(_id)}
        >
          <Text color={"red"}>{falseCount}</Text>
        </Button>
        <Button
          variant="ghost"
          fontWeight="regular"
          color="textlight"
          onClick={() =>
            showReply == _id ? setshowReply("") : setshowReply(_id)
          }
        >
        <BsChat colorScheme="#333" fontSize="28px" />
          <Text ml={2}>{replayCount}</Text>
        </Button>
      </Flex>
    </HStack>
    {showReply == _id && <SingleComment id={_id} commentHead={commentText} commentUsername={userId.channelName} setReplayCount={setReplayCount}/>}
  </Box>
)
};

const CommentsModal = ({
  commentList,
  downvoteComment,
  upvoteComment,
  submitBookmark,
  isOpenCommentModal,
  onToggleCommentModal,
  postTitle,
}) => {
  const [showReply, setshowReply] = useState("");
  return (
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
          h="95vh"
        >
          <Flex w={{ base: "100%", lg: "2xl", md: "70%" }}>
            <Box mt="4" bg="white" rounded="md" shadow="md" w="100%">
              <Flex p={4}>
                <Box mt={2} justifyContent="flex-start" w="100%" mb="2">
                  <Text mb="2" fontWeight="bold" fontSize="md">
                    Comments:
                  </Text>
                  <Text fontSize="md">{getExcerpt(postTitle, 50)}</Text>
                </Box>
                <Button variant="ghost" onClick={onToggleCommentModal}>
                  <IoClose fontSize="22px" />
                </Button>
              </Flex>
              <Divider />
              <Box h="90vh" overflowY="scroll" pb="60px" overflowX='hidden'>
                <VStack spacing={4} pb={4} mb={4} bg="lightgray">
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
  );
};

export default CommentsModal;
