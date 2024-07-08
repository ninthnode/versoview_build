import ReactModal from 'react-modal';
import { useState, useEffect } from "react";
import styles from "../styles/commentmodel.module.css"
import { collapseToast } from 'react-toastify';
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
import postDetailsStyles from "../styles/post-detail.module.css";
import {getAllCommentApi} from "../api/commentApi";
import DateTimeFormate from "../components/date-time-formate"

const CommentModal = ({ isOpen, onClose, postId }) => {
    const router = useRouter();
    const [showShareBox, setShowShareBox] = useState(false);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
    const [comments, setComments] = useState([]);
   
    useEffect(() => {
        if (postId) {
            const commentData = async () => {
                try {
                    const response = await getAllCommentApi(postId);
                    setComments(response.data);
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

    const handleMenuIconClick = (index) => {
        setSelectedMenuIndex(index);
        setShowShareBox(!showShareBox);
      };

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Comment Modal"
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                },
                content: {
                    position: 'relative',
                    top: '10px',
                    left: '0',
                    right: '0',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '20px',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    overflow: 'auto',
                },
                
            }}
        >
            {/* Your modal content here */}
            <div style={{paddingBottom: "60px"}}>
                <div className={styles.commentHeader}>
                    <p className={styles.commentStyle}>Comments:</p>
                    <button onClick={onClose}>X
                    </button>
                </div>
                <p className={styles.section}>VersoView wins BUILD gran from...</p>

                <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>

                <h1 style={{marginTop: "0px"}} onClick={handleBackButtonClick}>
                 <Image src={backarrow} alt="backarrow" style={{cursor: "pointer"}}/>
                </h1>

                {comments.map((item, index) => (
                <>
    <div className={styles.channelBar} key={index}>
        <div className={chatsStyle.channelName}>
            <Image
                src={item.postId?.channelId?.channelIconImageUrl}
                alt="chatimg2"
                width={36}
                height={36}
                style={{borderRadius: "4px", marginLeft: "3px"}}
            />
            <span>
                <p className={styles.title}>{item.postId?.channelId?.channelName}</p>
                <p className={styles.subTitle}>{DateTimeFormate(item.createdAt)}</p>
            </span>
        </div>
        <div className={styles.icons}>
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
                src={bookmark}
                alt="bookmark"
                style={{ cursor: "pointer" }}
                // onClick={() => handleBookmarkClick(index)}
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
                        //   onClick={() => handleLikeClick(post._id)}
                        />
                        <span className={postDetailsStyles.spanStyle2}>
                          {/* {upvoteCount} */}2
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={unlike}
                          alt="downvoteimage"
                          style={{ cursor: "pointer" }}
                        //   onClick={() => handleDislikeClick(post._id)}
                        />
                        <span className={postDetailsStyles.spanStyle3}>
                          {/* {downvoteCount} */}4
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={chat}
                          alt="comment"
                          style={{ cursor: "pointer" }}
                        //   onClick={handleComment}
                        />
                        <span className={postDetailsStyles.spanStyle1}>
                          {/* {dummyData[0].totalChats} */}23
                        </span>
                      </div>
                      <div><p className={styles.replyBtn}>Reply</p></div>
                </div>
</>
))} 
            </div>
        </ReactModal>

    );
};

export default CommentModal;
