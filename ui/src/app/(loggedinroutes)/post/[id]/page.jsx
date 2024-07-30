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
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { CiBookmark, CiShare2 } from "react-icons/ci";
import { connect } from "react-redux";
import {
  getPostById,
  updatePostUpvote,
  updatePostDownvote,
} from "@/redux/posts/postActions";
import { addCommentToPost } from "@/redux/comments/commentAction";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import ShareButton from "@/components/ShareButton";

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
      // setSelectedText(text);
      setSelectedText(text);
      onOpen();
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  return (
    <Box>
      <Flex alignItems="center" ml="4" mb={4}>
        <Link href={"/home"}>
          <Image m="0" src={"/assets/back.svg"} mr={2} />
        </Link>
      </Flex>
      {postState.post ? (
        <>
          <Card
            maxW="2xl"
            mt={2}
            mb={4}
            style={{ "--card-shadow": "transparent" }}
          >
            <CardHeader p={2}>
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Avatar
                    size="sm"
                    borderRadius={10}
                    src={
                      postState.channel.channelIconImageUrl != ""
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
            <Image objectFit="cover" src={postState.post.mainImageURL} alt="" />
            <CardBody>
              <Text mb="2" fontSize="14px">
                Explore - Maldives • 6min read
              </Text>
              <Divider />
              <Flex py="1">
                <Flex w="40%" justify="space-between">
                  <Link href={`/comments/${params.id}`}>
                    <Button variant="ghost" leftIcon={<FaRegComment />}>
                      {postState.commentsCount}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    leftIcon={<BiUpvote />}
                    onClick={() => {
                      updatePostUpvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    {postState.votes.trueCount}
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<BiDownvote />}
                    onClick={() => {
                      updatePostDownvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    {postState.votes.falseCount}
                  </Button>
                </Flex>
                {/* <Flex w="60%" justify="flex-end" mr="10">
                  <Button
                    variant="ghost"
                    leftIcon={<CiShare2 fontSize="20px" />}
                  >
                    
                  </Button>
                </Flex> */}
              </Flex>
              <Divider />
              <div onMouseUp={handleSelection} onTouchEnd={handleSelection}>
              <Text mt="4" bg="lightgray" w="fit-content" p="1">
                By {postState.user.channelName}
              </Text>
              <Heading size="md" as="h6" my="4">
                {postState.post.header}
              </Heading>
              <Text size="sm" fontSize="14px" textAlign="justify">
                {postState.post.bodyRichText}
              </Text>
              </div>
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
