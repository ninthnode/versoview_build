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
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { CiBookmark } from "react-icons/ci";
import { formatDateTime } from "@/app/utils/DateUtils";
import { FiMoreHorizontal } from "react-icons/fi";
import { getExcerptText } from "@/app/utils/GetExcerpt";
import Link from "next/link";
import { BsChat } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import useConfirmationDialog from "@/components/useConfirmationDialog";
import { useSelector } from "react-redux";

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
  postId,
  comment,
  updateCommentArray,
  replyToPostComment,
  level,
  parentComment,
  link = false,
  handleRedirectToPost,
  postSlug,
  getPreviousPage,
  pageNumber,
  replyCount,
  parentSetIsOpen,
  neighbourComments,
  sectionRefs=null,
  deleteComment,
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState(comment.opened || false);
  const [replyId, setReplyId] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const [showDeleteDialog, DeleteConfirmationDialog] = useConfirmationDialog(
    "Are you sure you want to delete this comment? This action cannot be undone."
  );

  // Get user directly from Redux with comprehensive fallback
  const reduxUser = useSelector(state => {
    // Try ALL possible auth state structures
    return state.auth?.user?.user || 
           state.auth?.user?.data ||
           state.auth?.user || 
           state.auth?.data?.user ||
           state.auth?.data ||
           state.auth?.currentUser ||
           null;
  });
  
  // Use Redux user as fallback if prop is undefined
  const actualCurrentUser = currentUser || reduxUser;
  
  // Get user ID with multiple fallbacks
  const getCurrentUserId = (user) => {
    if (!user) return null;
    return user._id || user.id || user.userId || user.user?._id || user.user?.id;
  };
  
  const handleChangeReplyText = (e) => {
    setReplyText(e.target.value);
  };
  const submitReplyText = (comment, commentId, replyText) => {
    replyToPostComment(commentId, replyText, postId, level, neighbourComments);
    setReplyText("");
  };

  const handleDeleteComment = async () => {
    if (!deleteComment) {
      console.error('Delete function not available');
      return;
    }
    
    const confirmed = await showDeleteDialog();
    if (confirmed) {
      deleteComment(_id, postId, level, parentComment, neighbourComments);
    }
  };

  // Helper function to check if user can delete this comment
  const checkCanDelete = () => {
    if (!actualCurrentUser) return false;
    
    // Admin can delete any comment
    if (actualCurrentUser.role === 'admin') return true;
    
    // Get current user ID with fallbacks
    const currentUserId = getCurrentUserId(actualCurrentUser);
    
    // Get comment owner ID with fallbacks
    const commentOwnerId = getCurrentUserId(userId) || userId?._id || userId?.id || userId;
    
    return currentUserId && commentOwnerId && 
           (currentUserId === commentOwnerId || 
            currentUserId.toString() === commentOwnerId.toString());
  };
  
  const canDelete = checkCanDelete();


  return (
    <Box w="100%" mb={4} bg="#fff" h={"100%"} key={_id} ref={(el) => {if(sectionRefs!==null){sectionRefs.current[_id] = el}}}>
      <HStack align="start" spacing={4} position="relative" px={2} pt={6}>
        <Avatar
          size="md"
          name={userId.channelName}
          src={userId.profileImageUrl}
        />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" fontSize="md">
            <Tooltip label={userId.channelName} aria-label="A tooltip">
              {userId.channelName && getExcerptText(userId.channelName, 20)}
            </Tooltip>
          </Text>
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
          {/* <IconButton
            variant="ghost"
            color="gray.400"
            aria-label="See menu"
            fontSize="25px"
            icon={<FiMoreHorizontal />}
          /> */}
          {canDelete && (
            <IconButton
              variant="ghost"
              color="red.500"
              aria-label="Delete comment"
              fontSize="lg"
              icon={<MdDelete />}
              onClick={handleDeleteComment}
            />
          )}
          <IconButton
            variant="ghost"
            color={!isBookmarked ? "gray" : "green.500"}
            aria-label="See menu"
            fontSize="lg"
            icon={!isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
            onClick={() => submitBookmark("comment", _id, !isBookmarked)}
          />
        </Box>
      </HStack>
      {parentComment && (
        <>
          <HStack
            spacing={4}
            ml="12%"
            mt={4}
            borderLeftWidth="4px"
            borderColor="#0F4CAE"
            paddingY="1"
          >
            <VStack align="start" spacing={1} ml={4}>
              <Text fontSize="md" fontWeight="bold">
                {parentComment.userId.channelName}
              </Text>
              <Text fontSize="md" color="gray.500">
                {getExcerptText(parentComment.commentText, 34)}
              </Text>
            </VStack>
          </HStack>
          <VStack align="center" spacing={2} mt="2" mr="2" ml="12%">
            {link ? (
              <div
                onClick={() => {
                  handleRedirectToPost(comment);
                }}
                style={{ width: "100%" }}
              >
                <Link href={`/post/${parentComment.userId.username}/${postSlug}`} disabled={!link}>
                  <Box p="4" bg="lightblue" borderRadius="md" w="100%">
                    <Text fontSize="md">{commentText}</Text>
                  </Box>
                </Link>
              </div>
            ) : (
              <Box p="4" bg="lightblue" borderRadius="md" w="100%">
                <Text fontSize="md">{commentText}</Text>
              </Box>
            )}
          </VStack>
        </>
      )}
      {parentComment == null && (
        <HStack spacing={2} px={4} py={2}>
          <Text mt="3" fontSize="md">
            {commentText}
          </Text>
        </HStack>
      )}
      <HStack
        ml={level === 1 ? "0" : "12%"}
        justifyContent="space-between"
        spacing={2}
        pl={level === 1 ? 4 : 0}
        pr={4}
        pb={4}
      >
        {showReply && (
          <Flex gap={"4"}>
            {level > 1 && (
              <Button
                onClick={async() => {
                  pageNumber <= 0 ? parentSetIsOpen(false) : getPreviousPage(sectionRefs,parentComment._id)
                }}
                size="sm"
                variant="ghost"
                mt="4"
                p="0"
                color="red.500"
              >
                x close thread
              </Button>
            )}
            {(replyCount > 0 || comment.replies.length > 0) && (
              <Button
                size="sm"
                mt="4"
                p="0"
                variant="ghost"
                onClick={async () => {
                  await updateCommentArray(comment._id, postId, level, neighbourComments);
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? "Hide Replies" : "View Replies"}
              </Button>
            )}
          </Flex>
        )}

        {!link && (
          <Flex gap={2} w="260px" alignItems="center" ml={link ? "12%" : "0"}>
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
              size="sm"
              variant="ghost"
              leftIcon={
                <BsChat
                  colorScheme="textlight"
                  fontSize="22px"
                  style={{ marginLeft: -7 }}
                />
              }
              aria-label="Upvote"
              onClick={async () => {
                await updateCommentArray(comment._id, postId, level, neighbourComments);
                  setIsOpen(!isOpen);
              }}
            >
              {replyCount}
            </Button>

            <Button
              size="sm"
              p="0"
              variant="ghost"
              color="gray.500"
              onClick={async () => {
                replyId != "" ? setReplyId("") : setReplyId(comment._id);
              }}
            >
              Reply
            </Button>
          </Flex>
        )}
      </HStack>
      {replyId != "" && (
        <Box textAlign="right" maxW="2xl" mt={2} px={4}>
          <Textarea
            type="reply"
            placeholder="Enter Reply..."
            name="replytext"
            value={replyText}
            onChange={handleChangeReplyText}
          />
          <Button
            onClick={async () => {
              await submitReplyText(comment, replyId, replyText);
              setReplyId("");
              setIsOpen(true);
            }}
            size="md"
            colorScheme="green"
          >
            Post{" "}
          </Button>
        </Box>
      )}
      <Box>
        {isOpen &&
          comment.replies &&
          comment.replies.filter(
            (item) =>
              typeof item === "object" && item !== null && !Array.isArray(item)
          ).length > 0 && (
            <Flex
              backgroundColor="lightgray"
              p={4}
              alignItems="center"
              w="100%"
              justifyContent="space-between"
            >
              <Text fontSize="md" fontWeight="bold">
                Replies to {userId.channelName}
              </Text>
              {pageNumber > 0 && (
                <Button
                  onClick={() => pageNumber <= 0 ? parentSetIsOpen(false) : getPreviousPage(sectionRefs,comment._id)
                  }
                  size="sm"
                  variant="ghost"
                  p="0"
                  color="#fff"
                  backgroundColor="gray.400"
                  _hover="gray.400"
                >
                  X
                </Button>
              )}
            </Flex>
          )}
      </Box>
      {isOpen &&
        comment.replies &&
        comment.replies.filter(
          (item) =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        ).length > 0 &&
        comment.replies.map((reply) => {
          return (
            typeof reply === "object" && (
                <Comment
                  key={reply._id}
                  setshowReply={setshowReply}
                  showReply={showReply}
                  comment={reply}
                  {...reply}
                  userId={reply.userId}
                  upvoteComment={upvoteComment}
                  downvoteComment={downvoteComment}
                  submitBookmark={submitBookmark}
                  postId={postId}
                  updateCommentArray={updateCommentArray}
                  replyToPostComment={replyToPostComment}
                  level={level + 1}
                  parentComment={comment}
                  getPreviousPage={getPreviousPage}
                  pageNumber={pageNumber}
                  parentSetIsOpen ={setIsOpen}
                  neighbourComments={comment.replies}
                  sectionRefs={sectionRefs}
                  deleteComment={deleteComment}
                  currentUser={currentUser}
                />
            )
          );
        })}
      {DeleteConfirmationDialog}
    </Box>
  );
};

export default Comment;
