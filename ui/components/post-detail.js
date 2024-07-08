import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/home.module.css";
import postDetailsStyles from "../styles/post-detail.module.css";
import Image from "next/image";
import Link from "next/link";
import brownlogo from "../public/images/brownlogo.svg";
import anantara from "../public/images/anantara.png";
import backarrow from "../public/images/backwardarrow.svg";
import community from "../public/images/community.svg";
import like from "../public/images/like.svg";
import unlike from "../public/images/unlike.svg";
import chat from "../public/images/chat.svg";
import setting from "../public/images/Cog.svg";
import share from "../public/images/bluetooth.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import doublechat from "../public/images/doublechat.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import dummyData from "../versoviewDummyData.json";
import profileImage from "../public/images/defaultProfile.svg";
import {getPostByIdApi} from "../api/postApi";
import getProfileApi from "../api/authApi";
import bookmarkApi from "../api/addBookmarks";
import removeBookmarkApi from "../api/removebookmark";
import upvoteApi from "../api/upvote";
import downvoteApi from "../api/downvote";
import votingApi from "../api/voting";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormatDate from "./formateDate";
import {postCommentApi} from "../api/commentApi";
import CommentModal from '../components/comment-model';
import Loader from '../components/loader';
import getAllBookmarkApi from "../api/getAllBookmark";
import CommentInputModel from "../components/commentInputModel";
import ShimmerPostEffect from "./shimmerPostDetail";
import {getAllCommentApi} from "../api/commentApi";

const PostDetail = ({ device }) => {
  const router = useRouter();
  const { postId } = router.query;
  const [loading, setLoading] = useState(true);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showShareBox, setShowShareBox] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState(
    []
  );
  const [totalComment, setTotalComment] = useState(0);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [showComment, setshowComment] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [dummyDataState, setDummyDataState] = useState(dummyData);
  const [post, setPost] = useState({});
  const [channelName, setchannelName] = useState("");
  const [channelImage, setchannelImage] = useState("");
  const [selectedText, setSelectedText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [token, setToken] = useState('');
  const [postDetail, setPostDetail] = useState({});
  const channelId = post.post?.channelId || postDetail.post?.channelId;
  const [authenticated, setAuthenticated] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (typeof window !== 'undefined') {
      setToken(token);
    }
  }, []);

  const handleClick = () => {
    if (!authenticated) {
      router.push('/login');
    } 
  }

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleSharePost = async (item) => {
    try {
      const shareData = {
        url: `https://versoview.currlybraces.com/post-detail?postId=${item}`, 
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        console.error("Share API is not supported");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (postId) {
          setLoading(true);
          if(token){
            const comments = await getAllCommentApi(postId);
            setTotalComment(comments.length);
          }
        
          const postData = await getPostByIdApi({postId});
          setPostDetail(postData);
          const bookmarkedPosts = await getAllBookmarkApi(); 
          const isPostBookmarked = bookmarkedPosts.data.some(bookmark => bookmark.postId?._id === postId);
          setIsBookmarked(isPostBookmarked);

          setPost(postData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        if (channelId) {
          setLoading(true);
          const postData = await getProfileApi({channelId});
          setchannelName(postData.data.channelName);
          setchannelImage(postData.data.channelIconImageUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchChannel();
  }, [channelId]);

 
  useEffect(() => {
    const fetchVotes = async () => {
      if(!token) {
        return;
      }
      try {
        const voteData = await votingApi({ postId });
        let trueCount = 0;
        let falseCount = 0;

        voteData.data.forEach(vote => {
          if (vote.voteType === true) {
            trueCount++;
          } else if (vote.voteType === false) {
            falseCount++;
          }
        });

        setUpvoteCount(trueCount);
        setDownvoteCount(falseCount);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };
    fetchVotes();
  }, [postId]);

  const fetchVotes = async (postId) => {
    try {
      const voteData = await votingApi({ postId });
      let trueCount = 0;
      let falseCount = 0;

      voteData.data.forEach(vote => {
        if (vote.voteType === true) {
          trueCount++;
        } else if (vote.voteType === false) {
          falseCount++;
        }
      });

      setUpvoteCount(trueCount);
      setDownvoteCount(falseCount);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const handleLikeClick = async (postId) => {
    await upvoteApi({postId});
    fetchVotes(postId);
  };

  const handleDislikeClick = async (postId) => {
    await downvoteApi({postId});
    fetchVotes(postId);
  };

  const handleBookmarkClick = async (index) => {
    try {
      const response = await bookmarkApi("post", index);
      if(response){
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  };

  const handleRemoveBookmarkClick = async (index) => {
    try {
      const response = await removeBookmarkApi("post", index);
      if(response){
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

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

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

  const handleBackButtonClick = () => {
    router.push('/home');
  };

  const handleComment = (postId) => {
    router.push({
        pathname: '/comments',
        query: { postId }
    });
};

  const handleSelection = () => {
    const text = window.getSelection().toString().trim();
    if (text) {
        setSelectedText(text);
        const selectionRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        setPosition({ x: selectionRect.left + window.pageXOffset, y: selectionRect.bottom + window.pageYOffset });
        setShowCommentInput(true);
    }
};

useEffect(() => {
  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('touchend', handleSelection);

  return () => {
    document.removeEventListener('mouseup', handleSelection);
    document.removeEventListener('touchend', handleSelection);
  };
}, []);

const handleModelClose = () => {
  console.log("close calling")
  setShowCommentInput(false);
}

  return (
    <>
    {loading ? (<ShimmerPostEffect />) : (token ?  (<div className={styles.container} style={{paddingBottom: "60px"}}>
        <div
          style={{marginTop: -10 }}
          className={`${styles.heading} ${postDetailsStyles.heading}`}
        >
          <h1 className={styles.boardingHead} onClick={handleBackButtonClick}>
            <Image src={backarrow} alt="backarrow" style={{cursor: "pointer"}}/>
          </h1>
          <div className={postDetailsStyles.header}>
            <div className={postDetailsStyles.totalCountingDiv}>
              <Image
                src={community}
                alt="community"
                className={styles.userIcon}
                style={{marginTop:30}}
              />
              <span className={postDetailsStyles.count}>23</span>
            </div>

            <Image
              src={setting}
              alt="setting"
              className={postDetailsStyles.settingIcon}
            />
          </div>
        </div>

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>

        <div>
          <div className={styles.userProfileContainer}>
            <div>
              <div className={styles.profileDetails}>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    <Image
                      src={channelImage || profileImage}
                      alt="brownlogo"
                      width="20"
                      height="20"
                      style={{width:20, height:20}}
                    />
                    <p className={styles.profileName} style={{marginLeft:10}}>{channelName}</p>
                  </div>
                  <div
                    className={`${styles.alignCenter} ${styles.shareContainer}`}
                  >
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick()}
                    />
                    {showShareBox && (
                      <div className={styles.shareBox1}>
                        {isShareSupported && (
                            <button onClick={() => handleSharePost(post.post?._id)}className={styles.shareBtn}>SHARE</button>
                          )}
                      </div>
                    )}
                    &nbsp;&nbsp;
                    <Image
                      src={isBookmarked ? filledbookmark : bookmark}
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        isBookmarked
                          ? handleRemoveBookmarkClick(post.post?._id)
                          : handleBookmarkClick(post.post?._id)
                      }
                      className={postDetailsStyles.bookmarkIcon}
                    />
                    &nbsp;
                  </div>
                </div>
                <div className={styles.aboutProfile}>
                  <img
                    src={post.post?.mainImageURL}
                    alt={"postImage"}
                    className={styles.imgStyle}
                  />
                </div>
                <div>
                  <div className={styles.miniContent}>
                    <p className={styles.proInfo}>
                      {post.post?.section || ""} - {post.post?.subSection || ""}  {FormatDate(post.post?.createdAt)} min read 
                      <span className={styles.chatIcons}>
                        <Image
                          src={doublechat}
                          alt="doublechat"
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                      <span className={styles.numStyle}>09</span>
                    </p>
                    <span className={styles.icons}>
                      <Image
                        src={book}
                        alt="book"
                        style={{ cursor: "pointer" }}
                        onClick={handleClick}
                      />
                    </span>
                  </div>
                  <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7, marginBottom:7}}></div>
                  <div className={postDetailsStyles.statusBox}>
                    <div className={postDetailsStyles.statusBoxChild}>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={chat}
                          alt="comment"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleComment(post.post?._id)}
                        />
                        <span className={postDetailsStyles.spanStyle1}>
                          {totalComment}
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={like}
                          alt="upvoteimage"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleLikeClick(post.post?._id)}
                        />
                        <span className={postDetailsStyles.spanStyle2}>
                          {upvoteCount}
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={unlike}
                          alt="downvoteimage"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleDislikeClick(post.post?._id)}
                        />
                        <span className={postDetailsStyles.spanStyle3}>
                          {downvoteCount}
                        </span>
                      </div>
                    </div>
                    <div className={postDetailsStyles.statusBoxChild}>
                      <Image
                        src={share}
                        alt="share"
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>
                  <p className={postDetailsStyles.smallPara}>
                    {post.post?.credits}
                  </p>
                  <h3 className={postDetailsStyles.profileHeading}>
                    {post.post?.Header} 
                  </h3>
                  <div onMouseUp={handleSelection} onTouchEnd={handleSelection} style={{position: "relative", width: "100%"}}>
                  <p className={styles.standFirst}>{post.post?.standFirst}</p>
                  <p className={styles.paraStyle}>{post.post?.bodyRichText}</p>
                  {showCommentInput && (
                      <CommentInputModel
                          isOpen={showCommentInput}
                          handleModelClose={handleModelClose}
                          postId={post.post?._id}
                          onClose={handleModelClose}
                          selectedText={selectedText}
                          username={post.user?.username}
                      />
                   )} 
                  </div>
                  {/* <p className={styles.paraStyle}>{post.bodyRichText}</p> */}

                  {/* <p className={styles.paraStyle}>{post.bodyRichText}</p> */}
                </div>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>) : (<div className={styles.container} style={{paddingBottom: "60px"}}>
        <div
          style={{marginTop: -10 }}
          className={`${styles.heading} ${postDetailsStyles.heading}`}
        >
          <h1 className={styles.boardingHead} onClick={handleBackButtonClick}>
            <Image src={backarrow} alt="backarrow" style={{cursor: "pointer"}}/>
          </h1>
          <div className={postDetailsStyles.header}>
            <div className={postDetailsStyles.totalCountingDiv}>
              <Image
                src={community}
                alt="community"
                className={styles.userIcon}
                style={{marginTop:30}}
              />
              <span className={postDetailsStyles.count}>23</span>
            </div>

            <Image
              src={setting}
              alt="setting"
              className={postDetailsStyles.settingIcon}
            />
          </div>
        </div>

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>

        <div>
          <div className={styles.userProfileContainer}>
            <div>
              <div className={styles.profileDetails}>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    <Image
                      src={channelImage || profileImage}
                      alt="brownlogo"
                      width="20"
                      height="20"
                      style={{width:20, height:20}}
                    />
                    <p className={styles.profileName} style={{marginLeft:10}}>{channelName}</p>
                  </div>
                  <div
                    className={`${styles.alignCenter} ${styles.shareContainer}`}
                  >
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick()}
                    />
                    {showShareBox && (
                      <div className={styles.shareBox}>
                        <p onClick={handleClick}>SHARE</p>
                      </div>
                    )}
                    &nbsp;&nbsp;
                    <Image
                      src={isBookmarked ? filledbookmark : bookmark}
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={handleClick}
                      className={postDetailsStyles.bookmarkIcon}
                    />
                    &nbsp;
                  </div>
                </div>
                <div className={styles.aboutProfile}>
                  <img
                    src={postDetail.post?.mainImageURL}
                    alt={"postImage"}
                    className={styles.imgStyle}
                  />
                </div>
                <div>
                  <div className={styles.miniContent}>
                    <p className={styles.proInfo}>
                      {postDetail.post?.section || ""} - {postDetail.post?.subSection || ""}  {FormatDate(postDetail.post?.createdAt)} min read 
                      <span className={styles.chatIcons}>
                        <Image
                          src={doublechat}
                          alt="doublechat"
                          style={{ cursor: "pointer" }}
                          onClick={handleClick}
                        />
                      </span>
                      <span className={styles.numStyle}>09</span>
                    </p>
                    <span className={styles.icons}>
                      <Image
                        src={book}
                        alt="book"
                        style={{ cursor: "pointer" }}
                        onClick={handleClick}
                      />
                    </span>
                  </div>
                  <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7, marginBottom:7}}></div>
                  <div className={postDetailsStyles.statusBox}>
                    <div className={postDetailsStyles.statusBoxChild}>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={chat}
                          alt="comment"
                          style={{ cursor: "pointer" }}
                          onClick={handleClick}
                        />
                        <span className={postDetailsStyles.spanStyle1}>
                          {/* {dummyData[0].totalChats} */}0
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={like}
                          alt="upvoteimage"
                          style={{ cursor: "pointer" }}
                          onClick={handleClick}
                        />
                        <span className={postDetailsStyles.spanStyle2}>
                          {upvoteCount}
                        </span>
                      </div>
                      <div className={postDetailsStyles.statusSubBox}>
                        <Image
                          src={unlike}
                          alt="downvoteimage"
                          style={{ cursor: "pointer" }}
                          onClick={handleClick}
                        />
                        <span className={postDetailsStyles.spanStyle3}>
                          {downvoteCount}
                        </span>
                      </div>
                    </div>
                    <div className={postDetailsStyles.statusBoxChild}>
                      <Image
                        src={share}
                        alt="share"
                        style={{ cursor: "pointer" }}
                        onClick={handleClick}
                      />
                    </div>
                  </div>
                  <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>
                  <p className={postDetailsStyles.smallPara}>
                    {postDetail.post?.credits}
                  </p>
                  <h3 className={postDetailsStyles.profileHeading}>
                    {postDetail.post?.Header} 
                  </h3>
                  {/* <div onMouseUp={handleSelection} style={{position: "relative", width: "100%"}}> */}
                  <p className={styles.standFirst}>{postDetail.post?.standFirst}</p>
                  <p className={styles.paraStyle}>{postDetail.post?.bodyRichText}</p>
                  {/* {showCommentInput && (
                    <div className={styles.commentBox}>
                      <div style={{position: "relative"}}>
                        <div className={postDetailsStyles.username}>
                          <p>{postDetail.user.username}</p>
                        </div>
                      <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Type here to post to chat"
                          className={styles.commentField}
                      />
                      <p></p>
                        <button onClick={() => handlePost(postId)} className={styles.commentPostBtn}>Post</button>
                      </div>
                    </div>

                  )} */}
                  {/* </div> */}
                </div>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>))}    
      <ToastContainer />
    </>
  );
};

export default PostDetail;