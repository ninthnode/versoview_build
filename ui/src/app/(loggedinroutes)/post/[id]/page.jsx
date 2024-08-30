"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Text,
  Flex,
  Image,
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
import { BsChat } from "react-icons/bs";
import { CiBookmark } from "react-icons/ci";
import Link from "next/link";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";

import { connect } from "react-redux";
import {
  getPostById,
  updatePostUpvote,
  updatePostDownvote,
} from "@/redux/posts/postActions";
import {
  addCommentToPost,
  getCommentByPostId,
  getCommentAndRepliesCount
} from "@/redux/comments/commentAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import PostMenu from "@/components/posts/PostMenu";
import ShareButton from "@/components/posts/ShareButton";
import Comments from "@/app/(loggedinroutes)/(comments)/comments/[id]/page";
import { formatDate } from "@/app/utils/DateUtils";
import RelatedArticleList from "./RelatedArticleList";
import DOMPurify from "dompurify";

function SinglePost({
  params,
  postState,
  getPostById,
  getCommentAndRepliesCount,
  addCommentToPost,
  updatePostUpvote,
  updatePostDownvote,
  addRemoveBookmarks,
  setNavTitle,
  isModalCommentsOpen,
  isAuthenticated,
  commentState,
  getCommentByPostId,
  postTotalComments
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedText, setSelectedText] = useState("");
  const [commentText, setCommentText] = useState("");
  const { isOpen: isOpenCommentModal, onToggle: onToggleCommentModal } =
    useDisclosure();

  useEffect(() => {
    if (isModalCommentsOpen) onToggleCommentModal();
  }, [isModalCommentsOpen]);
  useEffect(() => {
    getPostById(params.id);
    getCommentAndRepliesCount(params.id);
  }, [getPostById, params.id]);

  const handleChangeComment = (text) => {
    setCommentText(text);
  };

  const submitComment = async() => {
    const commentObj = {
      excerpt: selectedText,
      commentText: commentText,
    };
    await addCommentToPost(params.id, commentObj);
    await getCommentByPostId(params.id);
    setCommentText("");
    setSelectedText("");
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
    <Box maxW="2xl">
      {postState.post ? (
        <>
          <Card
            w={"100%"}
            mt={2}
            mb={4}
            style={{ "--card-shadow": "transparent" }}
          >
            <CardHeader py={2} px="0">
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Link href={`/channel/${postState.channel._id}`}>
                    <Avatar
                      size="sm"
                      borderRadius={10}
                      src={postState.channel.channelIconImageUrl}
                    />
                  </Link>
                  <Box>
                    <Link href={`/channel/${postState.channel._id}`}>
                      <Text fontWeight="semibold" fontSize="md">
                        {postState.channel.channelName}
                      </Text>
                    </Link>
                  </Box>
                </Flex>
                <PostMenu
                  url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${postState.post._id}`}
                  title={postState.post.header}
                />
                <IconButton
                  variant="nostyle"
                  aria-label="See menu"
                  fontSize="lg"
                  justifyContent="flex-end"
                  isDisabled={!isAuthenticated}
                  icon={
                    !postState.isBookmarked ? (
                      <CiBookmark style={{ margin: -5 }} />
                    ) : (
                      <BookmarkFilled color="green" style={{ margin: -5 }} />
                    )
                  }
                  onClick={() => submitBookmarkPost("post", postState.post._id)}
                />
              </Flex>
            </CardHeader>
            <Image
              border="1px solid lightgray"
              borderRadius="md"
              // h="300px"
              objectFit="cover"
              src={postState.post.mainImageURL}
              alt={postState.post.header}
            />
            <CardBody pt="0" px="0">
              <Text
                fontSize="sm"
                py="2"
                display="flex"
                gap="10px"
                alignItems="center"
                color="textlight"
              >
                {postState.post.section} - {postState.post.subSection} •{" "}
                {formatDate(postState.post.createdAt)} • {" "}
                  {postState.readingTime} read •{" "}
                <Flex cursor="pointer">
                  <Image src="../assets/chat-icon.png" h="1.2rem" w="1.4rem" />
                  <Text ml='1'>0</Text>
                </Flex>
              </Text>

              <Divider />
              <Flex py="1" gap={1}>
                <Flex w="300px" justify="space-between">
                  <Button
                    px="2"
                    variant="nostyle"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <BsChat
                        colorScheme="textlight"
                        fontSize="28px"
                        style={{ marginLeft: -7 }}
                      />
                    }
                    isDisabled={!isAuthenticated}
                    onClick={() => onToggleCommentModal()}
                  >
                    {postTotalComments?postTotalComments:0}
                  </Button>
                  <Button
                    px="2"
                    variant="nostyle"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatUpLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    isDisabled={!isAuthenticated}
                    onClick={() => {
                      updatePostUpvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"green.500"}>{postState.votes.trueCount}</Text>
                  </Button>
                  <Button
                    px="2"
                    variant="nostyle"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatDownLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    isDisabled={!isAuthenticated}
                    onClick={() => {
                      updatePostDownvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"red.500"}>{postState.votes.falseCount}</Text>
                  </Button>
                </Flex>
                <Flex w="100%" justify="flex-end">
                  <ShareButton
                    url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${postState.post._id}`}
                    title={postState.post.header}
                    shareButton={true}
                  />
                </Flex>
              </Flex>
              <Divider />
              <div
                onMouseUp={handleSelection}
                onTouchEnd={handleSelection}
                onClick={() => handleSelection}
              >
                <Text mt="2" w="fit-content" p="1" fontSize="sm">
                  By {postState.user.channelName}
                </Text>
                {postState.post.credits && (
                  <Text mt="2" w="fit-content" p="1" fontSize="sm">
                    Credits: {postState.post.credits}
                  </Text>
                )}
                {/* <Heading fontSize="2xl" as="h5" mb="2">
                  {postState.post.header}
                </Heading> */}
                <Heading
                  py="2"
                  mb="1"
                  fontWeight="bold"
                  fontSize="lg"
                  lineHeight="2rem"
                >
                  {postState.post.header}
                </Heading>
                <Text
                  pb="2"
                  mb="1"
                  fontWeight="semibold"
                  fontSize="1.2rem"
                  lineHeight="2rem"
                >
                  {postState.post.standFirst}
                </Text>
                <Text
                  fontSize="md"
                  textAlign="left"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(postState.post.bodyRichText),
                  }}
                />
              </div>

              <Divider mt={4} />
              <Comments
                postTitle={postState.post.header}
                id={params.id}
                isOpenCommentModal={isOpenCommentModal}
                onToggleCommentModal={onToggleCommentModal}
                commentText={commentText}
                handleChangeComment={handleChangeComment}
                submitComment={submitComment}
                isAuthenticated={isAuthenticated}
                getCommentByPostId={getCommentByPostId}
              />
              <RelatedArticleList />
            </CardBody>
          </Card>

          <Modal size="xl" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader fontSize="md">
                {postState.user.channelName}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb="4">{`"${selectedText}"`}</Text>
                <Textarea
                  defaultValue={commentText}
                  onChange={(e) => handleChangeComment(e.target.value)}
                  fontSize="sm"
                  placeholder="type here to post to chat.."
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="green"
                  mr={3}
                  fontSize="sm"
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
  isAuthenticated: state.auth.isAuthenticated,
  postState: state.post.singlePost,
  votes: state.post.postVotes,
  isModalCommentsOpen: state.comment.isModalCommentsOpen,
  commentState: state.comment.comments,
  postTotalComments: state.comment.postTotalComments,
});

const mapDispatchToProps = (dispatch) => ({
  getPostById: (id) => dispatch(getPostById(id)),
  getCommentAndRepliesCount: (id) => dispatch(getCommentAndRepliesCount(id)),
  getCommentByPostId: (id) => dispatch(getCommentByPostId(id)),
  addCommentToPost: (id, comment) => dispatch(addCommentToPost(id, comment)),
  updatePostUpvote: (id) => dispatch(updatePostUpvote(id)),
  updatePostDownvote: (id) => dispatch(updatePostDownvote(id)),
  addRemoveBookmarks: (type, postId) =>
    dispatch(addRemoveBookmarks(type, postId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
