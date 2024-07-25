"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  IconButton,
  Button,
  Input,
  Flex,
  Textarea,
  Image,
} from "@chakra-ui/react";
import { FaTelegramPlane } from "react-icons/fa";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import {
  getCommentByPostId,
  addCommentToPost,
  updateCommentUpvote,
  updateCommentDownvote,
} from "@/redux/comments/commentAction";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import { CiBookmark } from "react-icons/ci";

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
}) => (
  <Box w='100%' p={4} borderWidth="1px" borderRadius="md">
    <HStack spacing={4} position="relative">
      <Avatar name={userId.username} />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold">{userId.username}</Text>
        <Text fontSize="sm" color="gray.500">
          {createdAt}
        </Text>
        {excerpt&&<Box borderWidth="1px" borderRadius="md" boxShadow="lg" p="2">
          <Text>
            {'"'}
            {excerpt}
            {'"'}
          </Text>
        </Box>}
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
        <Link href={`/single-comment/${_id}`}>
          <Button size="sm" variant="link" mt="4">
            View Replies
          </Button>
        </Link>
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
  </Box>
);

const Comments = ({ params }) => {
  const dispatch = useDispatch();

  const commentState = useSelector((state) => state.comment.comments);

  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (commentState.length > 0) setCommentList(commentState);
  }, [commentState]);

  const submitBookmark = async (type, commentId) => {
    const response = await dispatch(addRemoveBookmarks(type, commentId));
    const updatedData = { isBookmarked: response.data.isBookmarked };
    setCommentList((prevItems) =>
      prevItems.map((item) =>
        item._id === response.data.postCommentId
          ? { ...item, ...updatedData }
          : item
      )
    );
  };
  useEffect(() => {
    dispatch(getCommentByPostId(params.id));
  }, [getCommentByPostId]);

  const upvoteComment = (commentId) => {
    dispatch(updateCommentUpvote(commentId));
    dispatch(getCommentByPostId(params.id));
  };
  const downvoteComment = (commentId) => {
    dispatch(updateCommentDownvote(commentId, params.id));
    dispatch(getCommentByPostId(params.id));
  };
  const submitComment = () => {
    let commentObj = {
      excerpt: "",
      commentText: commentText,
    };
    dispatch(addCommentToPost(params.id, commentObj));
    dispatch(getCommentByPostId(params.id));
    setCommentText("");
  };
  const handleChangeComment = (e) => {
    setCommentText(e.target.value);
  };
  return (
    <Box p={4}>
      <Flex alignItems="center" ml="4" mb={4}>
        <Link href={`/post/${params.id}`}>
          <Image m="0" src={"/assets/back.svg"} mr={2} />
        </Link>
      </Flex>

      <Flex  maxW="2xl" my="4" alignItems="flex-end">
        <Textarea
          type="comment"
          placeholder="Enter Comment..."
          name="commenttext"
          value={commentText}
          onChange={handleChangeComment}
        />
        <Button
          onClick={() => {
            submitComment();
          }}
          size="md"
          rightIcon={<FaTelegramPlane />}
          colorScheme="green"
        >
          Post
        </Button>
      </Flex>
      <VStack maxW="2xl" spacing={4}>
        {commentList.length?commentList.map((comment) => (
          <Comment
            key={comment._id}
            {...comment}
            upvoteComment={upvoteComment}
            downvoteComment={downvoteComment}
            submitBookmark={submitBookmark}
          />
        )):
        <Text>No Comments</Text>}
      </VStack>
    </Box>
  );
};

export default Comments;
