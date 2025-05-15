import React, { useState, useEffect } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import Comment from "@/components/comments/comment";
import { useDispatch, useSelector } from "react-redux";
import { openCommentModal } from "@/redux/comments/commentAction";
import {
  updateCommentUpvote,
  updateCommentDownvote,
} from "@/redux/comments/commentAction";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import Link from "next/link";
function Chats({ user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const commentStateUpdateCount = useSelector(
    (s) => s.comment.commentStateUpdateCount
  );

  useEffect(() => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    async function fetchComments() {
      try {
        if (user) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/post/getUserComments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Error fetching comments");
          }
          const data = await response.json();
          setComments(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      } finally {
      }
    }
    fetchComments();
  }, [user, commentStateUpdateCount]);

  const upvoteComment = async (changeCommentId) => {
    await dispatch(updateCommentUpvote(changeCommentId));
  };

  const downvoteComment = async (changeCommentId) => {
    await dispatch(updateCommentDownvote(changeCommentId));
  };
  const submitBookmark = async (type, commentId, bool) => {
    const response = await dispatch(addRemoveBookmarks(type, commentId, bool));
  };

  const handleRedirectToPost = async (singleComment) => {
    dispatch(openCommentModal(singleComment, "comment"));
  };
  if (!loading && user === undefined) {
    return (
      <Box
        minHeight="500px"
        maxH="500px"
        mt="2"
        border={"1px solid"}
        borderColor="gray.200"
        overflowX="none"
      >
        <Box height="500px">
          <Box
            height={"80%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <p>
              <Link href="/login"><span style={{color:'blue'}}>Login</span></Link> to view comments
            </p>
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box
      minHeight="500px"
      maxH="500px"
      mt="2"
      border={"1px solid"}
      borderColor="gray.200"
      overflowY="scroll"
      overflowX="none"
    >
      <Box height="500px">
        {loading && (
          <Box
            height={"80%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Spinner />
          </Box>
        )}

        {!loading && comments.length === 0 ? (
          <Box
            height={"50%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <p>No comments found.</p>
          </Box>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} style={{ marginBottom: "20px" }}>
              <Comment
                key={comment._id}
                showReply={false}
                comment={comment}
                {...comment}
                userId={comment.userId}
                upvoteComment={upvoteComment}
                downvoteComment={downvoteComment}
                submitBookmark={submitBookmark}
                // postId={postId}
                // updateCommentArray={updateCommentArray}
                // replyToPostComment={replyToPostComment}
                level={1}
                parentComment={comment.parentComment}
                link={true}
                postSlug={comment.postId.slug}
                handleRedirectToPost={handleRedirectToPost}
              />
            </div>
          ))
        )}
      </Box>
    </Box>
  );
}

export default Chats;
