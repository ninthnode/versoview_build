"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Text,
  Flex,
  Image,
  Link,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
} from "@chakra-ui/react";
import { FaRegComment } from "react-icons/fa";
import { CiBookmark, CiShare2 } from "react-icons/ci";

import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";

import { connect } from "react-redux";
import {
  getPostById,
  updatePostUpvote,
  updatePostDownvote,
} from "@/redux/posts/postActions";
import { addCommentToPost } from "@/redux/comments/commentAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import ShareButton from "@/components/ShareButton";
import Comments from "@/app/(loggedinroutes)/(comments)/comments/[id]/page";
import { formatDate } from "@/app/utils/DateUtils";

function SinglePost({
  params,
  postState,
  getPostById,
  addCommentToPost,
  updatePostUpvote,
  updatePostDownvote,
  addRemoveBookmarks,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedText, setSelectedText] = useState("");
  const [commentText, setCommentText] = useState("");

  const { isOpen: isOpenCommentModal, onToggle: onToggleCommentModal } =
    useDisclosure();

  useEffect(() => {
    getPostById(params.id);
  }, [getPostById, params.id]);

  const handleChangeComment = (text) => {
    setCommentText(text);
  };

  const submitComment = () => {
    const commentObj = {
      excerpt: selectedText,
      commentText: commentText,
    };
    addCommentToPost(params.id, commentObj);
    getPostById(params.id);
    onClose();
  };

  const submitBookmarkPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    getPostById(params.id);
  };

  const handleSelection = () => {
    const text = window.getSelection().toString().trim();
    if (text) {
      setSelectedText(text);
      onOpen();
    }
  };

  return (
    <Box maxW="2xl" px={4}>
      {postState.post ? (
        <>
          <Card
            w={"100%"}
            mt={2}
            mb={4}
            style={{ "--card-shadow": "transparent" }}
          >
            <CardHeader py={0} px="0">
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Avatar
                    size="sm"
                    borderRadius={10}
                    src={
                      postState.channel.channelIconImageUrl !== ""
                        ? postState.channel.channelIconImageUrl
                        : "../assets/default-post-image.svg"
                    }
                  />
                  <Box>
                    <Heading size="sm">{postState.channel.channelName}</Heading>
                  </Box>
                </Flex>
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${postState.post._id}`}
                  title={postState.post.header}
                />
                <IconButton
                  variant="ghost"
                  aria-label="See menu"
                  fontSize="20px"
                  colorScheme={!postState.isBookmarked ? "gray" : "green"}
                  icon={
                    !postState.isBookmarked ? (
                      <CiBookmark />
                    ) : (
                      <BookmarkFilled />
                    )
                  }
                  onClick={() => submitBookmarkPost("post", postState.post._id)}
                />
              </Flex>
            </CardHeader>
            <Image
              border="1px solid lightgray"
              borderRadius="md"
              objectFit="cover"
              src={postState.post.mainImageURL}
              alt={postState.post.header}
            />
            <CardBody pt='2' px='0'>
              <Text
                fontSize="12px"
                mt="1"
                display="flex"
                alignItems="center"
                color="textlight"
                pb={2}
              >
                {postState.post.section} - {postState.post.subSection} •{" "}
                {formatDate(postState.post.createdAt)} • 6min read
              </Text>

              <Divider />
              <Flex py="1" gap={1}>
                <Flex w="50%" justify="space-between">
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <FaRegComment colorScheme="textlight" fontSize="28px" />
                    }
                    onClick={() => onToggleCommentModal()}
                  >
                    {postState.commentsCount}
                  </Button>
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatUpLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    onClick={() => {
                      updatePostUpvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"green.500"}>{postState.votes.trueCount}</Text>
                  </Button>
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatDownLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    onClick={() => {
                      updatePostDownvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"red.500"}>{postState.votes.falseCount}</Text>
                  </Button>
                </Flex>
              </Flex>
              <Divider />
              <div
                onMouseUp={handleSelection}
                onTouchEnd={handleSelection}
                onClick={() => handleSelection}
              >
                <Text mt="2" w="fit-content" p="1">
                  By {postState.user.channelName}
                </Text>
                <Heading size="md" as="h6" mt="2" mb="4">
                  {postState.post.header}
                </Heading>
                <Text size="sm" fontSize="16px" textAlign="justify">
                  {postState.post.bodyRichText}
                </Text>
              </div>

              <Comments
                id={params.id}
                isOpenCommentModal={isOpenCommentModal}
                onToggleCommentModal={onToggleCommentModal}
              />
            </CardBody>
          </Card>

          <Modal size="xl" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{postState.user.channelName}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb="4">{`"${selectedText}"`}</Text>
                <Textarea
                  defaultValue={commentText}
                  onChange={(e) => handleChangeComment(e.target.value)}
                  placeholder="type here to post to chat.."
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="green"
                  mr={3}
                  onClick={() => submitComment()}
                >
                  Post
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        ""
      )}
    </Box>
  );
}

const mapStateToProps = (state) => ({
  postState: state.post.singlePost,
  votes: state.post.postVotes,
});

const mapDispatchToProps = (dispatch) => ({
  getPostById: (id) => dispatch(getPostById(id)),
  addCommentToPost: (id, comment) => dispatch(addCommentToPost(id, comment)),
  updatePostUpvote: (id) => dispatch(updatePostUpvote(id)),
  updatePostDownvote: (id) => dispatch(updatePostDownvote(id)),
  addRemoveBookmarks: (type, postId) =>
    dispatch(addRemoveBookmarks(type, postId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
