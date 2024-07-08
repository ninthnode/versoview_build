import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import channelStyles from "../styles/channel.module.css";
import bookmarkStyle from "../styles/bookmark.module.css";
import Image from "next/image";
import Link from "next/link";
import channelImg from "../public/images/img1.png";
import channelImg3 from "../public/images/img3.png";
import chaticon from "../public/images/squarechat.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import backarrow from "../public/images/backwardarrow.svg";
import doublechat from "../public/images/doublechat.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import {getProfileApi} from "../api/authApi";
import anantaraChannel from "../public/images/anantara-channel.png";
import journeysChannel from "../public/images/journeys-channel.png";
import {getAllPostByChannelId} from "../api/postApi";
import {followChannelApi,unfollowChannelApi} from "../api/channelApi";
import { useRouter } from 'next/router';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setFips } from "crypto";
import FormatDate from "./formateDate";
import profileImage from "../public/images/defaultProfile.svg";
import {GetFollowChannelApi} from "../api/channelApi";
import bookmarkApi from "../api/addBookmarks";
import removeBookmarkApi from "../api/removebookmark";
import getAllBookmarkApi from "../api/getAllBookmark";
import {FollowChannelList} from "../api/channelApi";
import {FollowersList} from "../api/channelApi";

const Channel = ({ device }) => {
  const router = useRouter();
  const { channelId } = router.query;
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showShareBox, setShowShareBox] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [channelDetail, setChannelDetail] = useState([]);
  const [posts, setPosts] = useState([])
  const [isFollowed, setIsFollowed] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const totalPosts = posts.length;
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

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
    const following = async () => {
      try {
        const response = await FollowChannelList();
        const totalFollowing = response.data.length;
        setFollowing(totalFollowing);
      } catch (error) {
        console.log(error);
      }
    }
    following();
  }, [])

  useEffect(() => {
    const followersChannelData = async () => {
      if (channelId) {
        try {
          const response = await FollowersList({ channelId });
          const totalFollwers = response.data.length;
          setFollowers(totalFollwers);
        } catch (error) {
          console.log(error);
        }
      }
    };
    followersChannelData();
  }, [channelId]);

  useEffect(() => {
    const followingChannelData = async () => {
      if (channelId) {
        try {
          const response = await GetFollowChannelApi({ channelId });
          if (response.data) {
            setIsFollowed(true);
          } else {
            setIsFollowed(false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    followingChannelData();
  }, [channelId]);

  useEffect(() => {
    const channelData = async () => {
      if (channelId) {
        try {
          const response = await getProfileApi({ channelId });
          if (response && response.data) {
            setChannelDetail(response.data);
          }
        } catch (error) {
          console.error('Error fetching channel data:', error);
        }
      }
    };
    channelData();
  }, [channelId]);

  useEffect(() => {
    const allPost = async () => {
      if (channelId) {
        try {
          const response = await getAllPostByChannelId({ channelId });
          const bookmarkedPosts = await getAllBookmarkApi();
          const updateData = response.data.map((item) => {
            let isBookmarked = bookmarkedPosts.data.find(singleBookmark => singleBookmark.postId?._id === item._id);
            return { ...item, isBookmarked: isBookmarked ? true : false }
          });
          setPosts(updateData.reverse());
        } catch (error) {
          console.error('Error fetching channel data:', error);
        }
      }
    };
    allPost();
  }, [channelId]);

  const handleBookmarkClick = async (postId) => {
    if (!authenticated) {
      router.push('/login');
    }

    try {
      const response = await bookmarkApi(postId);
      if (response.data) {
        setPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: true } : post));
        // toast.success("Added to bookmark");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  };

  const handleRemoveBookmarkClick = async (postId) => {
    if (!authenticated) {
      router.push('/login');
    }
    
    try {
      const response = await removeBookmarkApi(postId);
      if (response.status === 200) {
        setPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: false } : post));
        // toast.success("Removed from bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const handleMenuIconClick = (index) => {
    setShowShareBox(!showShareBox);
    setSelectedMenuIndex(index);
  };

  const handleFollowChannel = async () => {
    try {
      const response = await followChannelApi({ channelId });

      if (response.status == 201) {
        setFollowStates((prevStates) => ({
          ...prevStates,
          [channelId]: true,
        }));
        setIsFollowed(true);
        // toast.success(response.message);
      }

      if (response.status == 400) {
        setIsFollowed(true);
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error fetching channel data:', error);
    }
  }

  const handleUnfollowChannel = async () => {
    try {
      const response = await unfollowChannelApi({ channelId });

      if (response.status == 200) {
        setFollowStates((prevStates) => ({
          ...prevStates,
          [channelId]: false,
        }));
        setIsFollowed(false);
        // toast.success(response.message);
      }

      if (response.status == 404) {
        setIsFollowed(false);
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error fetching channel data:', error);
    }
  }

  const handleBackClick = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <>
      <div className={channelStyles.container}>
        <div className={channelStyles.heading}>
          <Link className={globalStyles.link} href="#" onClick={handleBackClick}>
            <Image
              src={backarrow}
              alt="backarrow"
              className={channelStyles.backarrow}
            />
          </Link>

          {channelDetail.channelIconImageUrl && (
            <Image
              src={channelDetail.channelIconImageUrl || profileImage}
              alt="channelImg"
              className={channelStyles.img}
              width={30}
              height={30}
            />
          )}
          <span

            className={`${styles.boardingHead} ${channelStyles.boardingHead}`}
          >
            &nbsp;
            {channelDetail.channelName}
          </span>
        </div>

        <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop: 0, marginBottom: 0 }}></div>
      </div>

      <div className={channelStyles.container}>
        <div className={styles.homeNav}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link
                href="/channel"
                className={`${styles.linkStyle} ${styles.active}`}
              >
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="#" className={styles.linkStyle}>
                Style
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="#" className={styles.linkStyle}>
                Explore
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="#" className={styles.linkStyle}>
                Inspire
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="#" className={styles.linkStyle}>
                Dine
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="#" className={styles.linkStyle}>
                Stay
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop: 0, marginBottom: 0 }}></div>

      <div
        className={channelStyles.aboutChannel}
      >
        <div className={channelStyles.parentBox}>
          <div className={channelStyles.childBox}>
            {channelDetail.channelIconImageUrl && (
              <Image
                src={channelDetail.channelIconImageUrl || profileImage}
                alt="channelimage"
                className={channelStyles.channelImage}
                width={59}
                height={59}
              />
            )}
          </div>
          <div className={channelStyles.childBox}>
            <h3 className={channelStyles.childhHeading}>
              {channelDetail.profileTitle}</h3>
            <p className={channelStyles.childParagraph}>
              {channelDetail.profileHandle}</p>
            <p className={channelStyles.childDescription}>
              {channelDetail.about}
            </p>
            <p className={channelStyles.childEmail}>{channelDetail.email}</p>
          </div>
          <div className={channelStyles.childBox}>
            {isFollowed ? <button className={channelStyles.followingBtn} onClick={handleUnfollowChannel}>Following</button> : <button className={channelStyles.btn} onClick={handleFollowChannel}>Follow</button>
            }
          </div>
        </div>
        <div className={channelStyles.parentBox}>
          <div className={channelStyles.contentBox_1}>
            <Link href={{
              pathname: "/chats",
              query: {
                userData: JSON.stringify(channelDetail),
              }
            }}>
              <div className={channelStyles.messageBox}>
                <Image
                  src={chaticon}
                  alt="chaticon"
                  className={channelStyles.chatImage}
                  style={{ cursor: "pointer" }}
                />
                <p className={channelStyles.message}>Message</p>
              </div>
            </Link>
          </div>
          <div className={channelStyles.contentBox_2}>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>{totalPosts}</p>
              <p className={channelStyles.contentStyle}>Posts</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>2</p>
              <p className={channelStyles.contentStyle}>Editions</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>{following}</p>
              <p className={channelStyles.contentStyle}>Following</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>{followers}</p>
              <p className={channelStyles.contentStyle}>Followers</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.userProfileContainer}>
          <div style={{ paddingBottom: "60px" }}>
            {posts.map((post, index) => (
              <div key={index} className={styles.profileDetails}>
                <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop: 0, marginBottom: -5 }}></div>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    {channelDetail.channelIconImageUrl && (
                      <Image
                        src={channelDetail.channelIconImageUrl || profileImage}
                        className={styles.smallImg}
                        width={20}
                        height={20}
                      />
                    )}
                    &nbsp;
                    <p className={styles.profileName}>{channelDetail.channelName}</p>
                  </div>
                  <div
                    className={`${styles.alignCenter} ${styles.shareContainer}`}
                  >
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick(index)}
                    />
                    {showShareBox && selectedMenuIndex === index && (
                      <div className={channelStyles.shareBox}>
                        {isShareSupported && (
                            <button onClick={() => handleSharePost(post._id)}className={channelStyles.shareBtn}>SHARE</button>
                        )}
                      </div>
                    )}
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <Image
                      src={
                        post.isBookmarked || bookmarkStates[post._id] ? filledbookmark : bookmark
                      }
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        post.isBookmarked || bookmarkStates[post._id]
                          ? handleRemoveBookmarkClick(post._id)
                          : handleBookmarkClick(post._id)
                      }
                    />
                    &nbsp;
                  </div>
                </div>

                <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop: -10, marginBottom: 5 }}></div>

                <div className={styles.aboutProfile} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: "5px" }}>
                  {channelDetail.channelIconImageUrl && (
                    <Image
                      src={post.
                        mainImageURL}
                      className={channelStyles.imgStyle}
                      width={50}
                      height={213}
                      alt="Post Main Image"
                      objectFit="contain"
                    />
                  )}
                  <span className={channelStyles.editionText}>
                    {post.bodyRichText}
                  </span>
                </div>
                <div>
                  {/* <div>
                    &nbsp;
                    <p className={styles.profileName}>{channelDetail.channelName}</p>
                  </div> */}
                  {/* <div
                    className={`${styles.alignCenter} ${styles.shareContainer}`}
                  >
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleMenuIconClick(index)}
                    />
                    {showShareBox && selectedMenuIndex === index && (
                      <div className={bookmarkStyle.shareBox}>
                        {isShareSupported && (
                          <button onClick={() => handleSharePost(post)}>SHARE</button>
                        )}
                      </div>
                    )}
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <Image
                      src={
                        post.isBookmarked || bookmarkStates[post._id] ? filledbookmark : bookmark
                      }
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        post.isBookmarked || bookmarkStates[post._id]
                          ? handleRemoveBookmarkClick(post._id)
                          : handleBookmarkClick(post._id)
                      }
                    />
                    &nbsp;
                  </div> */}
                </div>

                <div>
                  <div className={styles.miniContent} style={{ marginTop: 6 }}>
                    <p className={styles.proInfo}>
                      {post.subSection} {FormatDate(post.createdAt)} min
                      <span className={styles.chatIcons}>
                        <Image
                          src={doublechat}
                          alt="doublechat"
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                      <span className={styles.numStyle} style={{ marginLeft: 26 }}>127</span>
                    </p>
                    <span className={styles.icons}>
                      <Image
                        src={book}
                        alt="book"
                        style={{ cursor: "pointer" }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Channel;


