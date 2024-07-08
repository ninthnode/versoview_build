import { useState, useEffect } from "react";
import jwt_decode from 'jwt-decode';
import styles from "../styles/commentmodel.module.css";
import { toast } from "react-toastify";
import backarrow from "../public/images/backwardarrow.svg";
import { useRouter } from 'next/router';
import Image from "next/image";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import chatsStyle from "../styles/chats.module.css";
import chatimg2 from "../public/images/chatimg2.svg";
import menuicon from "../public/images/menu.svg";
import like from "../public/images/like.svg";
import unlike from "../public/images/unlike.svg";
import chat from "../public/images/chat.svg";
import chaticon from "../public/images/squarechat.svg";
import postDetailsStyles from "../styles/post-detail.module.css";
import {getAllCommentApi} from "../api/commentApi";
import DateTimeFormate from "../components/date-time-formate";
import {commentReplyApi} from "../api/commentApi";
import channelStyles from "../styles/channel.module.css";
import {getPostByIdApi} from "../api/postApi";
import profileImage from "../public/images/defaultProfile.svg";
import Replies from "../components/replies";
import {commentVotingApi} from "../api/commentApi";
import {commentDownvoteApi} from "../api/commentApi";
import {commentUpvoteApi,getAllReplyApi} from "../api/commentApi";
import checkOwnerApi from "../api/checkOwner";
import {deletePostCommentApi} from "../api/commentApi";
import bookmarkApi from "../api/addBookmarks";
import removeBookmarkApi from "../api/removebookmark";
import getAllBookmarkApi from "../api/getAllBookmark";

const CommentSection = ({ postId }) => {
    const router = useRouter();
    const [showShareBox, setShowShareBox] = useState(false);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
    const [comments, setComments] = useState([]);
    const [channelId, setChannelId] = useState("");
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyBox, setReplyBox] = useState(false);
    const [decoded, setDecoded] = useState(null);
    const [channelDetail, setChannelDetail] = useState([]);
    const [replyIndices, setReplyIndices] = useState({});
    const [replyCommentIndices, setReplyCommentIndices] = useState({});
    const [upvote, setupvote] = useState(0);
    const [downvote, setdownvote] = useState(0);
    const [totalReply, setTotalReply] = useState(0);
    const [isowner , setisOwner] = useState(false);

    const TotalCommentData = async (postId) => {
        try {
            const response = await getAllCommentApi(postId);
            setComments(response);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const response = await deletePostCommentApi({commentId});
            if(response.status === 200){
                TotalCommentData(postId);
            }
            console.log(response, "delete comment resoponse--")
        } catch(error){
            console.log(error);
        }
    }
     
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (showShareBox && !event.target.closest(`.${styles.icons}`)) {
            setShowShareBox(false);
            setSelectedMenuIndex(null);
          }
        };
    
        document.addEventListener("click", handleClickOutside);
    
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
      }, [showShareBox]);

    const handlePost = async(commentId, index) => {
        // commentData(postId);
        if(commentText) {
            const formadata = {
                commentReply: commentText,
            }
           await commentReplyApi(formadata, commentId);
           setReplyIndices(prevState => ({
            ...prevState,
            [index]: false
        }));
           setCommentText('');
           setShowCommentInput(false);
        } 
    }

    const handleComment = (index) => {
        setReplyCommentIndices(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    }

    useEffect(() => {
        if (postId) {
            const postData = async () => {
                try {
                    const response = await getPostByIdApi({postId});
                    setChannelDetail(response.channel);
                } catch (error) {
                    console.error("Error fetching comments:", error);
                }
            };
            postData();
        }
    }, [postId]);

    useEffect(() => {
        if (postId) {
            const commentData = async () => {
                try {
                    const ownerCheck = await checkOwnerApi({postId});
                    if(ownerCheck.status === 200){
                        setisOwner(true);
                    }

                    const response = await getAllCommentApi(postId);
                    const bookmarkedPosts = await getAllBookmarkApi();

                    if (response && bookmarkedPosts.data) {
                        const updatedComments = response.map(comment => {
                            const isBookmarked = bookmarkedPosts.data.some(bookmark =>
                                bookmark.postComment?._id === comment._id
                            );
                            return { ...comment, isBookmarked: isBookmarked ? true : false  };
                        });
    
                        setComments(updatedComments);
                        console.log("Updated comments:", updatedComments);
                    } else {
                        console.error("Error: Unexpected response structure");
                    }
                } catch (error) {
                    console.error("Error fetching comments:", error);
                }
            };
            commentData();
        }
    }, [postId]);

    const handleBackButtonClick = () => {
        router.push('/home');
    };

    const getFirstFourWords = (text) => {
        return text.split(" ").slice(0, 3).join(" ") + (text.split(" ").length > 3 ? "..." : "");
    };

    const commentData = async (postId) => {
        try {
            const response = await getAllCommentApi(postId);
            setComments(response);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleBookmarkClick = async (commentId) => {
        try {
            const response = await bookmarkApi("comment", commentId);
            if (response.data) {
                // Update the state of comments to reflect the bookmarked status
                const updatedComments = comments.map(comment =>
                    comment._id === commentId ? { ...comment, isBookmarked: true } : comment
                );
                setComments(updatedComments);
            }
        } catch (error) {
            console.error("Error bookmarking post:", error);
        }
    };

    const handleRemoveBookmarkClick = async (commentId) => {
        try {
            const response = await removeBookmarkApi("comment", commentId);
            if (response.status === 200) {
                const updatedComments = comments.map(comment =>
                    comment._id === commentId ? { ...comment, isBookmarked: false } : comment
                );
                setComments(updatedComments);
            }
        } catch (error) {
            console.error("Error removing bookmark:", error);
        }
    };

    const handleReply = (index) => {
        setReplyIndices(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };
    
    const handleMenuIconClick = (index) => {

        setSelectedMenuIndex(index);
        setShowShareBox(!showShareBox);
    };

    const handleUpvoteClick = async (postCommentId) => {
        await commentUpvoteApi({postCommentId});
        commentData(postId);
    }

    const handleDownvoteClick = async (postCommentId) => {
        await commentDownvoteApi({postCommentId});
        commentData(postId);
    }

    return (
        <div style={{ paddingBottom: "60px", margin: "16px"}} className={styles.container}>
            <div className={styles.commentHeader}>
                <p className={styles.commentStyle}>Comments:</p>
            </div>
            <p className={styles.section}>VersoView wins BUILD gran from...</p>

            <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop: 7 }}></div>

            <h1 style={{ marginTop: "0px" }} onClick={handleBackButtonClick}>
                <Image src={backarrow} alt="backarrow" style={{ cursor: "pointer" }} />
            </h1>

            {comments.map((item, index) => (
                <>
                    <div className={styles.channelBar} key={index}>
                        <div className={chatsStyle.channelName1}>
                            <Image
                                src={item.userId.profileImageUrl || profileImage}
                                alt="chatimg2"
                                width={36}
                                height={36}
                                style={{ borderRadius: "4px" }}
                            />
                            <span>
                                <p className={styles.title}>{item.userId?.channelName}</p>
                                <p className={styles.subTitle}>{DateTimeFormate(item.createdAt)}</p>
                            </span>
                        </div>
                        <div className={styles.icons}>
                            {isowner && 
                            <Image
                            src={menuicon}
                            alt="menuicon"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleMenuIconClick(index)}
                        /> }
                            
                            {showShareBox && selectedMenuIndex === index && (
                                <div className={styles.shareBox}>
                                  <button  onClick={() => deleteComment(item._id)}>Remove Comment</button>
                              </div>
                            )}
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Image
                                src={
                                    item.isBookmarked ? filledbookmark : bookmark
                                }
                                alt="bookmark"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    item.isBookmarked 
                                      ? handleRemoveBookmarkClick(item._id)
                                      : handleBookmarkClick(item._id)
                                }
                            />
                        </div>
                    </div>

                    <p className={styles.excerpt}>“{item.excerpt}…”</p>

                    <p className={styles.commentText}>{item.commentText}</p>
                    <div className={styles.statusBoxChild}>
                        <div className={postDetailsStyles.statusSubBox}>
                            <Image
                                src={like}
                                alt="upvoteimage"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleUpvoteClick(item._id)}
                            />
                            <span className={postDetailsStyles.spanStyle2}>
                                {item.totalVotes?.trueVotes}
                            </span>
                        </div>
                        <div className={postDetailsStyles.statusSubBox}>
                            <Image
                                src={unlike}
                                alt="downvoteimage"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDownvoteClick(item._id)}
                            />
                            <span className={postDetailsStyles.spanStyle3}>
                            {item.totalVotes?.falseVotes}
                            </span>
                        </div>
                        <div className={postDetailsStyles.statusSubBox}>
                            <Image
                                src={chat}
                                alt="comment"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleComment(index)}
                            />
                            <span className={postDetailsStyles.spanStyle1}>
                                {item.totalReplies}
                            </span>
                        </div>
                        <div><p className={styles.replyBtn} onClick={() => handleReply(index)}>Reply</p>
                        </div>
                    </div>
                    {replyCommentIndices[index] && <Replies replyId={item._id} postId={postId}/>}
                    {replyIndices[index] && (
                        <div className={styles.replyCommentBox}>
                        <div style={{position: "relative"}}>
                            <div className={styles.username}>
                            {/* <p>posting</p>  */}
                            <div className={chatsStyle.channelName1}>
                            <Image
                                src={item.userId.profileImageUrl || profileImage}
                                alt="chatimg2"
                                width={36}
                                height={36}
                                style={{ borderRadius: "4px", marginLeft: "11px" }}
                            />
                            <span>
                                <p className={styles.title}>Replying to: </p>
                                <p className={styles.subTitle}>{getFirstFourWords(item.commentText)}</p>
                            </span>
                        </div>
                            </div>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Type comment"
                            className={styles.commentField}
                        />
                        <p></p>
                            <div className={styles.replyButton}>
                            <button onClick={() => handlePost(item._id, index)} >Post</button>
                            </div>
                        </div>
                        </div>
                    )}
                </>
            ))}
        </div>
    );
};

export default CommentSection;
