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
import {getAllCommentReplyApi} from "../api/commentApi";
import DateTimeFormate from "./date-time-formate";
import postDetailsStyles from "../styles/post-detail.module.css";
import like from "../public/images/like.svg";
import unlike from "../public/images/unlike.svg";
import chat from "../public/images/chat.svg";
import {commentReplyApi,replyToCommentApi,getAllReplyApi} from "../api/commentApi";
import CommentReply from "./getCommentReply";

const CommentReplyComponent = ({ replyId }) => {
  const [showShareBox, setShowShareBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [reply, setReply] = useState([]);
  const [bookmarkStates, setBookmarkStates] = useState([]);
  const [showReply, setShowReply] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState("");
  const router = useRouter();

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
        const response = await getAllCommentReplyApi(replyId);
        setReply(response.data);
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

  return (
    <div className={replyStyles.replyContainer1}>
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
                      src={item?.userId?.profileImageUrl ? item?.userId?.profileImageUrl : profileImage}
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
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick(index)}
                    />
                    {showShareBox && selectedMenuIndex === index && (
                      <div className={chatsStyle.shareBox}>
                        <p>SHARE</p>
                      </div>
                    )}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Image
                      src={bookmarkStates[index] ? filledbookmark : bookmark}
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      // onClick={() => handleBookmarkClick(index)}
                    />
                  </div>
                </div>
                <div className={replyStyles.chatBox}>
                  <div className={chatsStyle.chatline}></div>
                  {/* <div className={chatsStyle.chatContent}>
                    <p className={chatsStyle.heading}>
                      {item?.userId?.channelName}
                    </p>
                    <p className={chatsStyle.description}>
                      {getFirstFourWords(item?.postCommentId?.comment)}
                    </p>
                  </div> */}
                  <div className={chatsStyle.chatContentBox1}>
                    <p>{item.commentReply}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentReplyComponent;
