import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Flex,
  Heading,
  Slide,
  Divider,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";
import { getExcerptText } from "@/app/utils/GetExcerpt";
import useDeviceType from "@/components/useDeviceType";
import Comment from "@/components/comments/comment";
import { useRef } from "react";

const CommentsModal = ({
  commentList,
  downvoteComment,
  upvoteComment,
  submitBookmark,
  isOpenCommentModal,
  onToggleCommentModal,
  isModalCommentsOpen,
  postTitle,
  postId,
  handleChangeComment,
  submitCommentByText,
  isAuthenticated,
  commentText,
  loading,
  updateCommentArray,
  replyToPostComment,
  getPreviousPage,
  pageNumber,
  modalComment,
  backToAllComments,
  postSlug,
  pageLoading,
  deleteComment,
  currentUser
}) => {
  const [showReply, setshowReply] = useState("");
  const deviceType = useDeviceType();
  const sectionRefs = useRef({});

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
          height={"100%"}
        ></Box>
      )}

      <Slide
        direction={deviceType == "desktop" ? "right" : "bottom"}
        in={isOpenCommentModal}
        style={{ zIndex: 1, height: "100%" }}
      >
        <Box
          ml={{ base: 0, md: "16rem" }}
          mr={{ base: 0, md: 5 }}
          mt={{ base: 4, md: 4 }}
          // pos={deviceType=='desktop'?'absolute':'relative'}
          // right={0}
          minh="95vh"
          height={"100%"}
        >
          <Flex w={{ base: "100%", lg: "2xl", md: "70%" }} height={"100%"}>
            <Box
              mt="4"
              bg="white"
              rounded="md"
              shadow="md"
              w="100%"
              height={"100%"}
              overflowY="auto"
            >
              <Flex p={4}>
                <Box mt={2} justifyContent="flex-start" w="100%" mb="2">
                  <Text mb="2" fontWeight="bold" fontSize="md">
                    Comments:
                  </Text>
                  <Text fontSize="md">{getExcerptText(postTitle, 50)}</Text>
                </Box>
                <Button variant="ghost" onClick={()=>{onToggleCommentModal();if(isModalCommentsOpen)backToAllComments()}}>
                  <IoClose fontSize="22px" />
                </Button>
              </Flex>
              {!isModalCommentsOpen || commentList[0]?.parentId==null? (
                pageNumber === 0 && 
                <Flex p="4" textAlign="right" gap="4">
                  <Textarea
                    type="comment"
                    placeholder="Enter Comment..."
                    name="commenttext"
                    value={commentText}
                    onChange={(e) => handleChangeComment(e.target.value)}
                    border="1px solid #000"
                    rows="3"
                  />
                  <Button
                    onClick={() => submitCommentByText(false)}
                    size="md"
                    colorScheme="green"
                    isDisabled={!isAuthenticated}
                  >
                    Post{" "}
                    {commentText !== "" && loading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      ""
                    )}
                  </Button>
                </Flex>
              ):
                <Button
                  onClick={() => backToAllComments()}
                  size="md"
                  variant="ghost"
                  border="1px solid grey"
                  m="2"
                >
                  back to all comments
                </Button>
              }

              <Divider />
              {/* {pageNumber > 0 && (
                <Button
                  onClick={() => getPreviousPage()}
                  size="md"
                  variant="ghost"
                  border="1px solid grey"
                  m="2"
                >
                  back
                </Button>
              )} */}

              <Box minH="90vh" pb="60px" overflowX="hidden">
                <VStack spacing={4} pb={4} mb={4} bg="lightgray" h="100%" overflowY="auto">
                  <React.Fragment>
                    {commentList&&commentList.length > 0 ? (
                      commentList.map((comment) => (
                        <Comment
                          setshowReply={setshowReply}
                          showReply={true}
                          key={comment._id}
                          comment={comment}
                          {...comment}
                          upvoteComment={upvoteComment}
                          downvoteComment={downvoteComment}
                          submitBookmark={submitBookmark}
                          postId={postId}
                          updateCommentArray={updateCommentArray}
                          replyToPostComment={replyToPostComment}
                          level={1}
                          parentComment={null}
                          postSlug={postSlug}
                          getPreviousPage={getPreviousPage}
                          pageNumber={pageNumber}
                          sectionRefs={sectionRefs}
                          deleteComment={deleteComment}
                          currentUser={currentUser}
                        />
                      ))
                    ) : (
                      pageLoading? <Spinner mt='2'/>:
                      <Text>No Comments</Text>
                    )}
                  </React.Fragment>
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
