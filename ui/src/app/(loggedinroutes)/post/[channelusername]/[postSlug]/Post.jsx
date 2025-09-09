"use client";
import React, { useState, useEffect, use } from "react";
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
  Tooltip,
} from "@chakra-ui/react";
import { BsChat } from "react-icons/bs";
import { CiBookmark } from "react-icons/ci";
import Link from "next/link";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";

import { connect } from "react-redux";
import {
  clearPost,
  updatePostUpvote,
  updatePostDownvote,
  getPostById,
} from "@/redux/posts/postActions";
import {
  addCommentToPost,
  getCommentByPostId,
  getCommentAndRepliesCount,
  deleteComment,
} from "@/redux/comments/commentAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import PostMenu from "@/components/posts/PostMenu";
import ShareButton from "@/components/posts/ShareButton";
import Comments from "@/app/(loggedinroutes)/(comments)/comments/[id]/page";
import { formatDate } from "@/app/utils/DateUtils";
import RelatedArticleList from "./RelatedArticleList";
import DOMPurify from "dompurify";
import { getExcerptText } from "@/app/utils/GetExcerpt";
import HighlighterTag from "@/components/posts/HighlighterTag/core";
import Loader from "@/components/Loader";
import dynamic from "next/dynamic";
const PdfFlipBookModal = dynamic(
  () => import("@/components/posts/PdfFlipBookModal"),
  {
    ssr: false,
  }
);

import { fetchPosts as fetchChannelPosts } from "@/redux/channel/channelActions";
function SinglePost({
  params,
  postState,
  getPostById,
  clearPost,
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
  postTotalComments,
  fetchChannelPosts,
  channelPosts,
  deleteComment,
  currentUser,
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
    clearPost();
    getCommentAndRepliesCount(params.postSlug);
    getPostById(params.postSlug);
  }, [getPostById, params.postSlug]);

  const handleChangeComment = (text) => {
    setCommentText(text);
  };

  const submitComment = async () => {
    const commentObj = {
      excerpt: selectedText,
      commentText: commentText,
    };
    await addCommentToPost(params.postSlug, commentObj);
    await getCommentByPostId(params.postSlug);
    setCommentText("");
    setSelectedText("");
    onClose();
  };

  const submitBookmarkPost = async (type, postId) => {
    const res = await addRemoveBookmarks(type, postId);
    getPostById(params.postSlug);
  };

  const handleSelection = (text) => {
    if (text) {
      setSelectedText(text);
      onOpen();
    }
  };
  useEffect(() => {
    const highlighter = HighlighterTag({
      _onOpen: (popover, text) => {
        // console.log("Popover opened with text: ", text);
      },
      onClick: (selectedText) => {
        handleSelection(selectedText);
        // console.log("You clicked on: ", selectedText);
      },
      onClose: () => {
        console.log("Popover closed");
      },
    });
    highlighter.init();
  }, []);

  useEffect(() => {
    if (postState.post) {
      fetchChannelPosts(postState.post.channelId);
    }
  }, [postState.post]);

  return (
    <Box px={4}>
      {!postState.post && <Loader />}
      {postState.post ? (
        <>
          <Card
            w={"100%"}
            mt={2}
            mb={4}
            style={{ "--card-shadow": "transparent" }}
          >
            <CardHeader py={2} px="0">
              <Flex w="100%" justifyContent="space-between" alignItems="center">
                <Flex alignItems="center" w={{ base: "220px", sm: "100%" }}>
                  <Link href={`/channel/${postState.channel.username}`}>
                    <Avatar
                      size="sm"
                      borderRadius={10}
                      src={postState.channel.channelIconImageUrl}
                    />
                  </Link>
                  <Link href={`/channel/${postState.channel.username}`}>
                    <Text ml="2" fontWeight="semibold" fontSize="md">
                      <Tooltip
                        label={postState.channel.channelName}
                        aria-label="A tooltip"
                      >
                        {getExcerptText(postState.channel.channelName, 45)}
                      </Tooltip>
                    </Text>
                  </Link>
                </Flex>
                <Flex>
                  <PostMenu
                    url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${postState.channel.username}/${postState.post.slug}`}
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
                    onClick={() =>
                      submitBookmarkPost("post", postState.post._id)
                    }
                  />
                </Flex>
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
              <Flex py="2" w="100%" justify="space-between">
                <Flex
                  w="100%"
                  justify="flex-start"
                  alignItems="flex-start"
                  flexWrap="nowrap"
                >
                  <Text
                    color="textlight"
                    fontSize="sm"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    flexShrink={1}
                  >
                    {postState.post.section}  {postState.post.section&& "●"} {postState.post.subSection}{" "}
                     {postState.post.subSection&& "●"}  {formatDate(postState.post.createdAt)} &bull;{" "}
                    {postState.readingTime} read
                  </Text>
                  <Flex
                    alignItems="center"
                    mx="2"
                    flexShrink={0}
                    cursor="pointer"
                    onClick={() => isAuthenticated && onToggleCommentModal()}
                  >
                    <Image
                      src="/assets/chat-icon.png"
                      h="1.2rem"
                      w="1.4rem"
                    />
                    <Text color="textlight" fontSize="sm" ml="1">
                      {postState.commentCount}
                    </Text>
                  </Flex>
                </Flex>

                <Box>
                  {postState &&
                    postState.post.editionId?.pdfUrls?.length > 0 && (
                      <PdfFlipBookModal
                        title={
                          postState.post.editionId?.editionText +
                          " " +
                          postState.post.editionId?.editionDate
                        }
                        editionId ={
                          postState.post.editionId?._id
                        }
                      />
                    )}
                </Box>
              </Flex>

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
                    {postTotalComments ? postTotalComments : 0}
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
                      updatePostUpvote(params.postSlug);
                      getPostById(params.postSlug);
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
                      updatePostDownvote(params.postSlug);
                      getPostById(params.postSlug);
                    }}
                  >
                    <Text color={"red.500"}>{postState.votes.falseCount}</Text>
                  </Button>
                </Flex>
                <Flex w="100%" justify="flex-end">
                  <ShareButton
                    url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${postState.channel.username}/${postState.post.slug}`}
                    title={postState.post.header}
                    shareButton={true}
                  />
                </Flex>
              </Flex>
              <Divider />
              <div
              // onMouseUp={handleSelection}
              // onTouchStart={handleSelection}
              // onTouchEnd={handleSelection}
              // id="selection-div"
              // onClick={() => handleSelection}
              >
                {/* <Text mt="2" w="fit-content" p="1" fontSize="sm">
                  By {postState.user.channelName}
                </Text> */}
                {postState.post.credits && (
                  <Text mt="2" w="fit-content" p="1" fontSize="sm">
                    By: {postState.post.credits}
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
                {postState.post.standFirst && (
                  <Heading
                    py="1"
                    mb="1"
                    fontWeight="bold"
                    fontSize="1.4rem"
                    lineHeight="1.5rem"
                  >
                    {postState.post.standFirst}
                  </Heading>
                )}
                <Text
                  fontSize="md"
                  textAlign="left"
                  sx={{
                    a: {
                      color: "blue.500", // Change link color
                      _hover: {
                        color: "blue.700", // Darker blue on hover
                      },
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(postState.post.bodyRichText),
                  }}
                />
              </div>

              <Divider mt={4} />
              <Comments
                postTitle={postState.post.header}
                id={params.postSlug}
                isOpenCommentModal={isOpenCommentModal}
                isModalCommentsOpen={isModalCommentsOpen}
                onToggleCommentModal={onToggleCommentModal}
                commentText={commentText}
                handleChangeComment={handleChangeComment}
                submitComment={submitComment}
                isAuthenticated={isAuthenticated}
                getCommentByPostId={getCommentByPostId}
                postSlug={postState.post.slug}
                deleteComment={deleteComment}
                currentUser={currentUser}
                postChannelOwner={postState.user}
              />
              {channelPosts && channelPosts.length > 0 && (
                <RelatedArticleList channelPosts={channelPosts} />
              )}
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
  channelPosts: state.channel.posts.data,
  currentUser: state.auth.user?.user || state.auth.user || state.auth.data,
});

const mapDispatchToProps = (dispatch) => ({
  getPostById: (id) => dispatch(getPostById(id)),
  fetchChannelPosts: (id) => dispatch(fetchChannelPosts(id)),
  clearPost: (id) => dispatch(clearPost(id)),
  getCommentAndRepliesCount: (id) => dispatch(getCommentAndRepliesCount(id)),
  getCommentByPostId: (id) => dispatch(getCommentByPostId(id)),
  addCommentToPost: (id, comment) => dispatch(addCommentToPost(id, comment)),
  updatePostUpvote: (id) => dispatch(updatePostUpvote(id)),
  updatePostDownvote: (id) => dispatch(updatePostDownvote(id)),
  addRemoveBookmarks: (type, postId) =>
    dispatch(addRemoveBookmarks(type, postId)),
  deleteComment: (commentId, postId, level, parentComment, neighbourComments) =>
    dispatch(deleteComment(commentId, postId, level, parentComment, neighbourComments)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
