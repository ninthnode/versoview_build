import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import commentStyles from "../styles/commentmodel.module.css";
import chatsStyle from "../styles/chats.module.css";
import replyStyles from "../styles/replies.module.css";
import profileImage from "../public/images/defaultProfile.svg";
import Image from "next/image";
import menuicon from "../public/images/menu.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import { useRouter } from 'next/router';
import {getAllReplyApi,getAllCommentReplyApi} from "../api/commentApi";
import DateTimeFormate from "../components/date-time-formate";
import postDetailsStyles from "../styles/post-detail.module.css";
import like from "../public/images/like.svg";
import unlike from "../public/images/unlike.svg";
import chat from "../public/images/chat.svg";
import {commentReplyApi} from "../api/commentApi";
import CommentReply from "./getCommentReply";
import {commentDownvoteApi} from "../api/commentApi";
import {commentUpvoteApi,deleteReplyApi,replyToCommentApi} from "../api/commentApi";
import checkOwnerApi from "../api/checkOwner";

const Replies = ({ replyId, postId }) => {
  const [showShareBox, setShowShareBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [reply, setReply] = useState([]);
  const [bookmarkStates, setBookmarkStates] = useState([]);
  const [showReply, setShowReply] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const [replyIndices, setReplyIndices] = useState({});
  const [replyCommentIndices, setReplyCommentIndices] = useState({});
  const [isowner , setisOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const checkOwner = await checkOwnerApi({ postId });
        if (checkOwner.status === 200) {
          setisOwner(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [postId]);

  const handleComment = (index) => {
    setReplyCommentIndices(prevState => ({
        ...prevState,
        [index]: !prevState[index]
    }));
}

  const handleReply = (index) => {
    setReplyIndices(prevState => ({
        ...prevState,
        [index]: !prevState[index]
    }));
};

  const handlePost = async(commentId, index) => {
    fetchReplies(replyId);
    if(commentText) {
        const formadata = {
            commentReply: commentText,
        }
      await replyToCommentApi(formadata, commentId);
      
       setReplyIndices(prevState => ({
        ...prevState,
        [index]: false
    }));
       setCommentText('');
       setShowCommentInput(false);
    } 
}

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareBox && !event.target.closest(`.${styles.shareContainer}`)) {
        setShowShareBox(false);
        setSelectedMenuIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showShareBox]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await getAllReplyApi(replyId);
        setReply(response);
        setUserName(response.data[0]?.postCommentId?.userId?.channelName);
        setBookmarkStates(new Array(response.data.length).fill(false));
      } catch (error) {
        console.log(error);
      }
    };

    if (replyId) {
      fetchReplies();
    }
  }, [replyId]);

  const handleClose = () => {
    setShowReply(false);
  }

  const handleBookmarkClick = (index) => {
    const newBookmarkStates = [...bookmarkStates];
    newBookmarkStates[index] = !newBookmarkStates[index];
    setBookmarkStates(newBookmarkStates);
  };

  const getFirstFourWords = (text) => {
    return text.split(" ").slice(0, 3).join(" ") + (text.split(" ").length > 3 ? "..." : "");
  };

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

const goBack = () => {
    router.back();
};

const fetchReplies = async (replyId) => {
  try {
    const response = await getAllReplyApi(replyId);
    setReply(response.data);
    // setUserName(response.data[0]?.postCommentId?.userId?.channelName);
    // setBookmarkStates(new Array(response.data.length).fill(false));
  } catch (error) {
    console.log(error);
  }
}; 

const handleUpvoteClick = async (postCommentId) => {
    const response = await commentUpvoteApi({postCommentId});
    fetchReplies(replyId);
}

const handleDownvoteClick = async (postCommentId) => {
    await commentDownvoteApi({postCommentId});
    fetchReplies(replyId)
}

const fetchReply = async (replyId) => {
  try {
    const response = await getAllReplyApi(replyId);
    setReply(response);
    setUserName(response.data[0]?.postCommentId?.userId?.channelName);
    setBookmarkStates(new Array(response.data.length).fill(false));
  } catch (error) {
    console.log(error);
  }
};

const handleRemoveComment = async (Id) => {
  try {
      const response = await deleteReplyApi({Id});
      if(response.status === 200){
        fetchReply(replyId);
      }
      console.log(response, "delete comment resoponse--")
  } catch(error){
      console.log(error);
  }
}

  return (
    <div className={replyStyles.replyContainer}>
      {showReply && (
        <>
          <div className={replyStyles.chatContent}>
            <span className={chatsStyle.comment}>Replies To {userName}</span>
            <p className={replyStyles.closebtn}><span style={{ marginTop: "1px" }} onClick={handleClose}>x</span></p>
          </div>
          <div style={{ marginTop: 15 }}>
            {reply.map((item, index) => (
              <div key={index}>
                <div className={replyStyles.channelBar}>
                  <div className={chatsStyle.channelName}>
                    <Image
                      src={item?.userId?.profileImageUrl || profileImage}
                      alt="chatimg2"
                      width={36}
                      height={36}
                      style={{ borderRadius: "4px" }}
                    />
                    <span>
                      <p className={replyStyles.title}>{item?.userId?.channelName}</p>
                      <p className={replyStyles.subTitle}>
                        {DateTimeFormate(item.createdAt)}
                      </p>
                    </span>
                  </div>
                  <div className={`${replyStyles.alignCenter} ${styles.shareContainer}`}>
                    {isowner && (
                      <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick(index)}
                     />
                    )}

                    {showShareBox && selectedMenuIndex === index && (
                      // <div className={chatsStyle.shareBox}>
                      //   <p onClick={() => handleRemoveComment(item._id)}>Remove Comment</p>
                      // </div>
                      <div className={styles.shareBox}>
                      <button  onClick={() => handleRemoveComment(item._id)}>Remove Comment</button>
                  </div>
                    )}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {/* <Image
                      src={bookmarkStates[index] ? filledbookmark : bookmark}
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleBookmarkClick(index)}
                    /> */}
                  </div>
                </div>
                <div className={replyStyles.chatBox}>
                  <div className={chatsStyle.chatline}></div>
                  <div className={chatsStyle.chatContent}>
                    <p className={chatsStyle.heading}>
                      {item?.postCommentId?.userId?.channelName}
                    </p>
                    <p className={chatsStyle.description}>
                      {getFirstFourWords(item?.postCommentId?.commentText)}
                    </p>
                  </div>
                  <div className={chatsStyle.chatContentBox1}>
                    <p>{item.commentReply}</p>
                  </div>
                </div>
                <div style={{ marginBottom: 15 }}>
                <div className={replyStyles.statusBoxChild}>
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
                    {replyCommentIndices[index] && <CommentReply replyId={item._id}/>}
                    {replyIndices[index] && (
                        <div className={commentStyles.replyCommentBox}>
                        <div style={{position: "relative"}}>
                            <div className={commentStyles.username1}>
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
                                <p className={commentStyles.title}>Replying to: </p>
                                <p className={commentStyles.subTitle}>{getFirstFourWords(item.commentReply)}</p>
                            </span>
                        </div>
                            </div>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Type comment"
                            className={commentStyles.commentField1}
                        />
                        <p></p>
                            <div className={commentStyles.replyButton1}>
                            <button onClick={() => handlePost(item._id, index)} >Post</button>
                            </div>
                        </div>
                        </div>
                    )}
                  {/* {index === reply.length - 1 ? (
                    <div className={chatsStyle.alignItem}>
                      <p className={chatsStyle.viewstyle1}>
                        View all comments
                      </p>
                      <a className={chatsStyle.reply1}>Reply</a>
                    </div>
                  ) : (
                    <div className={chatsStyle.alignSingleItem}>
                      <a className={chatsStyle.reply1}>Reply</a>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Replies;
