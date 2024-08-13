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
import { CiBookmark } from "react-icons/ci";

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
import { setNavTitle } from "@/redux/navbar/action";
import RelatedArticleList from "./RelatedArticleList";
import DOMPurify from "dompurify";

function SinglePost({
  params,
  postState,
  getPostById,
  addCommentToPost,
  updatePostUpvote,
  updatePostDownvote,
  addRemoveBookmarks,
  setNavTitle,
  isModalCommentsOpen,
  isAuthenticated,
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
  useEffect(() => {
    if (postState && postState.post) {
      const defaultImageUrl = "/assets/default-post-image.svg";
      setNavTitle(
        postState.channel.channelName,
        postState.channel.channelIconImageUrl
          ? postState.channel.channelIconImageUrl.toString()
          : defaultImageUrl
      );
    }
  }, [postState]);

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
            <CardHeader py={2} px="0" pl="1">
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Link href={`/channel/${postState.post.channelId._id}`}>
                    <Avatar
                      size="sm"
                      borderRadius={10}
                      src={
                        postState.channel.channelIconImageUrl !== ""
                          ? postState.channel.channelIconImageUrl
                          : "../assets/default-post-image.svg"
                      }
                    />
                  </Link>
                  <Box>
                    <Link href={`/channel/${postState.post.channelId._id}`}>
                      <Heading fontSize="lg">
                        {postState.channel.channelName}
                      </Heading>
                    </Link>
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
                  isDisabled={!isAuthenticated}
                  icon={
                    !postState.isBookmarked ? (
                      <CiBookmark />
                    ) : (
                      <BookmarkFilled color="green" />
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
            <CardBody pt="2" px="0">
              <Text mt="1" display="flex" alignItems="center" pb={2}>
                {postState.post.section} - {postState.post.subSection} •{" "}
                {formatDate(postState.post.createdAt)} • 6min read
              </Text>

              <Divider />
              <Flex py="1" gap={1}>
                <Flex w="300px" justify="space-between">
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <FaRegComment colorScheme="textlight" fontSize="28px" />
                    }
                    isDisabled={!isAuthenticated}
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
                    isDisabled={!isAuthenticated}
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
                <Text mt="2" w="fit-content" p="1">
                  By {postState.user.channelName}
                </Text>
                <Heading fontSize="2xl" as="h5" mb="2">
                  {postState.post.header}
                </Heading>
                <Heading fontSize="xl" as="h6" mb="4">
                  {postState.post.standFirst}
                </Heading>
                <Text
                  fontSize="md"
                  textAlign="justify"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(postState.post.bodyRichText),
                  }}
                />
              </div>

              <Divider mt={4}/>
              <Comments
                postTitle={postState.post.header}
                id={params.id}
                isOpenCommentModal={isOpenCommentModal}
                onToggleCommentModal={onToggleCommentModal}
                commentText={commentText}
                handleChangeComment={handleChangeComment}
                submitComment={submitComment}
                isAuthenticated={isAuthenticated}
              />
              <RelatedArticleList />
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
  isAuthenticated: state.auth.isAuthenticated,
  postState: state.post.singlePost,
  votes: state.post.postVotes,
  isModalCommentsOpen: state.comment.isModalCommentsOpen,
});

const mapDispatchToProps = (dispatch) => ({
  getPostById: (id) => dispatch(getPostById(id)),
  addCommentToPost: (id, comment) => dispatch(addCommentToPost(id, comment)),
  updatePostUpvote: (id) => dispatch(updatePostUpvote(id)),
  updatePostDownvote: (id) => dispatch(updatePostDownvote(id)),
  addRemoveBookmarks: (type, postId) =>
    dispatch(addRemoveBookmarks(type, postId)),
  setNavTitle: (title, icon) => dispatch(setNavTitle(title, icon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
