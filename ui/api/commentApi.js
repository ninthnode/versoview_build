import axios from "axios";
import ServerUrl from "../context/production";


export const getAllCommentApi = async (postId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getAllComment/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const comments = response.data.data;
  
      // Mapping through all comments to get the voting and reply data
      const mappedComments = await Promise.all(
        comments.map(async (comment) => {
          // Get voting data
          const votingData = await commentVotingApi({ postCommentId: comment._id });
  
          // Get reply data
          const replyData = await getAllReplyApi(comment._id);
  
          // Calculate total votes
          const totalVotes = votingData.data.reduce(
            (acc, vote) => {
              if (vote.voteType) {
                acc.trueVotes += 1;
              } else {
                acc.falseVotes += 1;
              }
              return acc;
            },
            { trueVotes: 0, falseVotes: 0 }
          );
  
          return {
            ...comment,
            totalReplies: replyData.length,
            totalVotes,
          };
        })
      );
  
      return mappedComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  };

export const commentDownvoteApi = async ({postCommentId}) => {
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.put(
      `${ServerUrl}/api/v1/post/downvoteComment/${postCommentId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const commentReplyApi = async (formData, postCommentId) => {
    console.log(formData, postCommentId, "form data, postCOmmentId")
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/postCommentReply/${postCommentId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response, "response of comment post---")
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const commentUpvoteApi = async ({postCommentId}) => {
    console.log(postCommentId, "in the api-")
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/upvoteComment/${postCommentId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const commentVotingApi = async ({ postCommentId }) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${ServerUrl}/api/v1/post/commentVoting/${postCommentId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching voting data:", error);
        throw error;
    }
};

export const deletePostCommentApi = async ({commentId}) => {
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const response = await axios.delete(
        `${ServerUrl}/api/v1/post/deletePostComment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response.data, "delete post comment response---")
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  export const deleteReplyApi = async (replyId) => {
    const id = replyId.Id;
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const response = await axios.delete(
        `${ServerUrl}/api/v1/post/deleteCommentReply/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response.data, "delete reply to comment response---")
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };
  
  export const postCommentApi = async (formData, postId) => {
    try {
      const token = localStorage.getItem("token");
  
      if(!token) {
        return {status: 401, message: "Unauthorized"}
      }
  
      const response = await axios.post(
        `${ServerUrl}/api/v1/post/postComment/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response, "response of comment post---")
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };
  
  export const getAllCommentReplyApi = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getCommentReplies/${replyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log(response.data, "response of data---")
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  export const replyToCommentApi = async (formData, commentId) => {
    console.log(formData, commentId, "form data, postCOmmentId")
  try {
    const token = localStorage.getItem("token");

    if(!token) {
      return {status: 401, message: "Unauthorized"}
    }

    const response = await axios.post(
      `${ServerUrl}/api/v1/post/commentReply/${commentId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response, "response of comment post---")
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllReplyApi = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(`${ServerUrl}/api/v1/post/getAllCommentReplies/${replyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const comments = response.data.data;
  
      const mappedComments = await Promise.all(
        comments.map(async (comment) => {
          // Get voting data
          const votingData = await commentVotingApi({ postCommentId: comment._id });
        
          // Get reply data
          const replyData = await getAllCommentReplyApi(comment._id);
  
          // Calculate total votes
          const totalVotes = votingData.data.reduce(
            (acc, vote) => {
              if (vote.voteType) {
                acc.trueVotes += 1;
              } else {
                acc.falseVotes += 1;
              }
              return acc;
            },
            { trueVotes: 0, falseVotes: 0 }
          );
  
          return {
            ...comment,
            totalReplies: replyData.data.length,
            totalVotes,
          };
        })
      );
  
      return mappedComments;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };