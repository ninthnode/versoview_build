import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/home.module.css";
import exploreStyle from "../styles/explore.module.css";
import channelStyles from "../styles/channel.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import menuicon from "../public/images/menu.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import book from "../public/images/book.svg";
import doublechat from "../public/images/doublechat.svg";
import searchicon from "../public/images/search.svg";
import profilesData from "../profileData.json";
import filterPostApi from "../api/filterPostByTopics";
import {getAllPost} from "../api/postApi";
import FormatDate from "./formateDate";
import getAllBookmarkApi from "../api/getAllBookmark";
import bookmarkApi from "../api/addBookmarks";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import removeBookmarkApi from "../api/removebookmark";
import {getUserByIdApi} from "../api/authApi";
import jwtDecode from "jwt-decode";
import {getAllChannelApi} from "../api/channelApi";
import profileImage from "../public/images/defaultProfile.svg";

const Explore = ({ device }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [bookmarkStates, setBookmarkStates] = useState([]);
  const [showShareBox, setShowShareBox] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelDetail, setChannelDetail] = useState([]);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedMenuType, setSelectedMenuType] = useState("");
  const router = useRouter();

  const handleTitle = (channelId) => {
    router.push(`/channel?channelId=${channelId}`);
  }

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleSharePost = async (item) => {
    try {
      const shareData = {
        url: `https://versoview.currlybraces.com/post-detail?postId=${item._id}`,
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
    const channelData = async () => {
      try {
        const response = await getAllChannelApi();
        if (response) {
          setChannelDetail(response);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };
    channelData();
  }, []);

  const filteredExploreData = filteredPosts.length > 0
    ? filteredPosts.filter((item) =>
      item.channelData.data?.channelName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : posts.filter((item) =>
      item.channelId?.channelName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredUsersData = channelDetail.filter((item) => 
    item.channelData?.profileTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    getAllPost()
      .then((data) => {
        setPosts(data.reverse());
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          const decodedToken = jwtDecode(storedToken);
          setUserId(decodedToken.id);

          const response = await getUserByIdApi({ username: decodedToken.username });
          setSelectedTopics(response.genre);
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

  const handleMenuSelect = (type) => {
    setSelectedMenuType(type);
    setSearchQuery("");
    setMenuOpen(false);
  };

  useEffect(() => {
    const filterPosts = async (selectedTopics) => {
      try {
        if (selectedTopics && selectedTopics.length > 0) {
          const filteredPostsResponse = await filterPostApi(selectedTopics);
          const bookmarkedPosts = await getAllBookmarkApi();

          const updateData = filteredPostsResponse.map((item) => {
            let isBookmarked = bookmarkedPosts.data.find(singleBookmark => singleBookmark.postId?._id === item._id);
            return { ...item, isBookmarked: isBookmarked ? true : false };
          });
          setFilteredPosts(updateData);
        }
      } catch (error) {
        console.error("Error filtering posts:", error);
      }
    };

    filterPosts(selectedTopics);
  }, [selectedTopics]);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleBookmarkClick = async (postId) => {
    try {
      const response = await bookmarkApi("post", postId);
      if (response.data) {
        setFilteredPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: true } : post));
        toast.success("Added to bookmark");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  };

  const handleRemoveBookmarkClick = async (postId) => {
    try {
      const response = await removeBookmarkApi("post", postId);
      if (response.status === 200) {
        setFilteredPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: false } : post));
        toast.success("Removed from bookmark");
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(`.${styles.shareContainer}`)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className={styles.container}>
        <div className={`${styles.heading} ${exploreStyle.heading}`}>
          <span className={`${styles.boardingHead}`}>
            <Image src={logo} alt="logo" />
            &nbsp;Explore
          </span>
        </div>

        <div style={{ width: "100%", height: 1, backgroundColor: '#707070', opacity: 0.1 }}></div>

        <div className={exploreStyle.searchBar} style={{ marginTop: 4 }}>
          <form>
            <div className={exploreStyle.inputGroup}>
              <input
                type="search"
                style={device === "desktop" ? { width: "440px" } : null}
                className={exploreStyle.searchInput}
                placeholder={selectedMenuType}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={exploreStyle.searchIconPosition}>
                <Image src={searchicon} alt="searchicon" />
              </span>
            </div>
          </form>

          <span className={`${styles.icons} ${styles.shareContainer}`}>
            <Image
              src={menuicon}
              alt="menuicon"
              onClick={toggleMenu}
              style={{ cursor: "pointer" }}
              className={exploreStyle.menuIcon}
            />
            {isMenuOpen && (
              <div className={exploreStyle.popupContainer}>
                <div className={exploreStyle.popup}>
                  <div className={exploreStyle.popupStyle} onClick={() => handleMenuSelect("articles")}>ARTICLES</div>
                  <div style={{ width: "100%", height: 1, backgroundColor: '#707070', opacity: 0.1, marginTop: 10, marginBottom: 10 }}></div>
                  <div className={exploreStyle.popupStyle} onClick={() => handleMenuSelect("users")}>USERS</div>
                  <div style={{ width: "100%", height: 1, backgroundColor: '#707070', opacity: 0.1, marginTop: 10, marginBottom: 10 }}></div>
                  <div className={exploreStyle.popupStyle}>
                    <span className={exploreStyle.chatIcons}>
                      <Image
                        src={doublechat}
                        alt="doublechat"
                        style={{ cursor: "pointer" }}
                        className={exploreStyle.iconPos}
                      />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CHATS
                    </span>
                  </div>
                </div>
              </div>
            )}
          </span>
        </div>

        <div style={{ width: "100%", height: 1, backgroundColor: '#707070', opacity: 0.1, marginTop: 3 }}></div>
        
        {selectedMenuType === "" && (
          <div className={exploreStyle.messageBox}><p>Search articles, users and chats</p></div>
        )}

        {selectedMenuType === "articles" && (
          <div style={{ paddingBottom: "60px" }}>
            {filteredExploreData.map((item, index) => (
              <div key={item._id} className={styles.profileDetails}>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    <Image
                      src={item.channelData?.data.channelIconImageUrl || item.channelId?.channelIconImageUrl || profileImage}
                      alt="image"
                      className={styles.smallImg}
                      width={20}
                      height={20}
                    />
                    <span className={styles.profileName} style={{ marginLeft: 5 }}>
                      {item.channelData?.data?.channelName || item.channelId?.channelName}
                    </span>
                  </div>
                  <div className={`${styles.alignCenter} ${styles.shareContainer}`}>
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={device === "mobile" ? { cursor: "pointer", width: 20, height: 3 } : { cursor: "pointer", width: 20, height: 3 }}
                      onClick={() => handleMenuIconClick(index)}
                    />
                    {showShareBox && selectedMenuIndex === index && (
                      <div className={styles.shareBox}>
                        {isShareSupported && (
                          <button onClick={() => handleSharePost(item)}>SHARE</button>
                        )}
                      </div>
                    )}
                    <Image
                      src={item.isBookmarked ? filledbookmark : bookmark}
                      alt="bookmark"
                      style={device === "mobile" ? { cursor: "pointer", width: 11, height: 15, marginLeft: 25 } : { cursor: "pointer", width: 11, height: 15, marginLeft: 25 }}
                      onClick={() =>
                        item.isBookmarked
                          ? handleRemoveBookmarkClick(item._id)
                          : handleBookmarkClick(item._id)
                      }
                    />
                  </div>
                </div>
                <div className={styles.aboutProfile}>
                  {/* <img
                      src={item.mainImageURL}
                      alt="image"
                      className={styles.imgStyle}
                      onClick={() => handlePostClick(item._id)}
                    /> */}
                </div>
                <div>
                  <div className={styles.miniContent} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <p className={styles.proInfo}>
                      {item.section} - {item.subSection} {FormatDate(item.createdAt)} min read 122
                      <span className={styles.chatIcons}>
                        <Image
                          src={doublechat}
                          alt="doublechat"
                          style={device === "mobile" ? { cursor: "pointer", width: 17, height: 15 } : { cursor: "pointer", width: 17, height: 15, marginLeft: 10 }}
                        />
                      </span>
                      <span className={styles.numStyle}>127</span>
                    </p>
                    <span className={styles.icons}>
                      <Image
                        src={book}
                        alt="book"
                        style={device === "mobile" ? { cursor: "pointer", width: 16, height: 14, marginTop: -5 } : { cursor: "pointer", width: 16, height: 14, marginTop: -5 }}
                      />
                    </span>
                  </div>
                  <h3 className={styles.profileHeading}>{item.header}</h3>
                  <span className={styles.paraStyle}>
                    {item.bodyRichText}
                  </span>
                </div>
                <div style={{ width: "100%", height: 2, backgroundColor: "#707070", opacity: 0.1, marginTop: 12 }}></div>
              </div>
            ))}
          </div>
        )}

        {selectedMenuType === "users" && (
          <div>
            <div className={styles.aboutChannel}>
                  {(filteredUsersData.length ? filteredUsersData : channelDetail).map((item, index) => (
                     <div className={exploreStyle.parentBox}>
                     <div className={channelStyles.childBox}>
                         <Image
                           src={item.channelData?.channelIconImageUrl || profileImage}
                           alt="channelimage"
                           className={channelStyles.channelImage}
                           width={59}
                           height={59}
                         />
                     </div>
                     <div className={channelStyles.childBox}>
                       <h3 className={channelStyles.childhHeading} onClick={() => handleTitle(item.channelData?._id)}>
                         {item.channelData?.profileTitle}</h3>
                       <p className={channelStyles.childParagraph}>
                         {item.channelData?.profileHandle}</p>
                       <p className={channelStyles.childDescription}>
                         {item.channelData?.about}
                       </p>
                       <p className={channelStyles.childEmail}>{item.channelData?.email}</p>
                     </div>
                     {/* <div className={channelStyles.childBox}>
                       {isFollowed ? <button className={channelStyles.followingBtn} onClick={handleUnfollowChannel}>Following</button> : <button className={channelStyles.btn} onClick={handleFollowChannel}>Follow</button>
                       }
                     </div> */}
                   </div>
                  ))}
            </div>
          </div>
        )}

        <hr />
      </div>
    </>
  );
};

export default Explore;

