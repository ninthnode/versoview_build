import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/home.module.css";
import bookmarkStyle from "../styles/bookmark.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import community from "../public/images/community.svg";
import menuicon from "../public/images/menu.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import doublechat from "../public/images/doublechat.svg";
import profilesData from "../profileData.json";
import searchicon from "../public/images/search.svg";
import removeBookmarkApi from "../api/removebookmark";
import getAllBookmarkApi from "../api/getAllBookmark";
import FormatDate from "./formateDate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import profileImage from "../public/images/defaultProfile.svg";

const Bookmark = ({ device }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showShareBox, setShowShareBox] = useState(false);
  const [bookmarkData, setBookmarkData] = useState([]);
  const [sortingOption, setSortingOption] = useState("latest");
  const [bookmarkStates, setBookmarkStates] = useState(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [searchText, setSearchText] = useState("NFT");
  const router = useRouter();

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleSharePost = async (item) => {
    try {
      const shareData = {
        url: `https://versoview.currlybraces.com/post-detail?postId=${item.postId._id}`, 
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
    getAllBookmarks();
  }, []);

  const handleSortingOptionChange = (option) => {
    setSortingOption(option);
    setSearchText(option);
  };

  useEffect(() => {
    getAllBookmarks(sortingOption); 
  }, [sortingOption]);

  const getAllBookmarks = async (sortingOption) => {
    try {
      const response = await getAllBookmarkApi();
      const bookmarks = response.data;
      let sortedBookmarks = [];

      // Sort bookmarks based on the selected sorting option
      switch (sortingOption) {
        case "A-Z":
          sortedBookmarks = bookmarks.sort((a, b) =>
            a.postId?.channelId.channelName.localeCompare(
              b.postId?.channelId.channelName
            )
          );
          break;
        case "latest":
          sortedBookmarks = bookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "genre":
          sortedBookmarks = bookmarks.sort((a, b) => {
            const genreA = a.postId?.genre || "";
            const genreB = b.postId?.genre || ""; 
            return genreA.localeCompare(genreB);
          })
          break;
        default:
          sortedBookmarks = bookmarks;
          break;
      }

      setBookmarkData(sortedBookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleRemoveBookmarkClick = async (type, postId) => {
    try {
      let response;
  
      if (type === "post") {
        response = await removeBookmarkApi("post", postId);
      } else if (type === "comment") {
        response = await removeBookmarkApi("comment", postId);
      }
  
      if (response && response.status === 200) {
        const newBookmarkStates = [...bookmarkStates];
        const index = bookmarkStates.findIndex(state => state.postId === postId);
        
        if (index !== -1) {
          newBookmarkStates[index] = !newBookmarkStates[index];
          setBookmarkStates(newBookmarkStates);
        }
  
        window.location.reload();
      } else {
        toast.error(response?.error || 'Error removing bookmark');
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error('Error removing bookmark');
    }
  };
  
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

  const handleClick = (id, type) => {
    if (type === 'post') {
      window.location.href = `/post-detail?postId=${id}`;
    } else if (type === 'comment') {
      window.location.href = `/comments?postId=${id}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareBox && !event.target.closest(`.${styles.shareContainer}`)) {
        setShowShareBox(false);
        setSelectedMenuIndex(null);
      }

      if (isMenuOpen && !event.target.closest(`.${styles.shareContainer}`)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showShareBox, isMenuOpen]);


  const filteredBookmarkData = bookmarkData.filter((item) =>
    (item.postChannel?.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.postCommentChannel?.channelName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log(bookmarkData, "bookmarks-----")

  return (
    <>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span
            className={`${styles.boardingHead} ${bookmarkStyle.boardingHead}`}
          >
            <Image src={logo} alt="logo" />
            &nbsp;Bookmarks
          </span>
          <div className={styles.totalCountingDiv}>
            <Image
              src={community}
              alt="community"
              className={styles.userIcon}
            />
            <span className={styles.count}>23</span>
          </div>
        </div>

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1,}}></div>

        <div className={bookmarkStyle.searchBar} style={{marginTop:4}}>
          <form style={{width:'90%'}}>
            <div className={bookmarkStyle.inputGroup}>
              <input
                type="search"
                style={{ width: "100%" }}
                className={bookmarkStyle.searchInput}
                placeholder={searchText}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={bookmarkStyle.searchIconPosition}>
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
              className={bookmarkStyle.menuIcon}
            />
            {isMenuOpen && (
              <div className={bookmarkStyle.popupContainer}>
                <div className={bookmarkStyle.popup}>
                  <div className={bookmarkStyle.popupStyle} onClick={() => handleSortingOptionChange("A-Z")}>A-Z</div>
                  <hr />
                  <div className={bookmarkStyle.popupStyle} onClick={() => handleSortingOptionChange("latest")}>LATEST</div>
                  <hr />
                  <div className={bookmarkStyle.popupStyle} onClick={() => handleSortingOptionChange("genre")}>GENRE</div>
                </div>
              </div>
            )}
          </span>
        </div>

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:3}}></div>

        <div style={{paddingBottom : "60px"}}>
          {/* {filteredBookmarkData.map((item, index) => {
            return (
              <div key={item._id} className={styles.profileDetails}>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    <img
                      src={item.postId.mainImageURL}
                      alt={"name"}
                      className={styles.smallImg}
                    />
                    &nbsp;
                    <p className={styles.profileName}>
                      {item.postId.channelId.channelName}
                      </p>
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
                      <div className={bookmarkStyle.shareBox}>
                        {isShareSupported && (
                            <button onClick={() => handleSharePost(item)}>SHARE</button>
                        )}
                      </div>
                    )}
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <Image
                      src={filledbookmark}
                      alt="bookmark"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemoveBookmarkClick(item.postId._id)}
                    />
                    &nbsp;
                  </div>
                </div>
                <div className={styles.aboutProfile}>
                  <img
                    src={item.postId.mainImageURL}
                    alt={"postImage"}
                    className={styles.imgStyle}
                  />
                </div>
                <div>
                  <div className={styles.miniContent}>
                    <p className={styles.proInfo}>
                    {item.postId.section} - {item.postId.subSection} {FormatDate(item.postId.createdAt)} min
                      <span className={styles.chatIcons}>
                        <Image src={doublechat} alt="doublechat" />
                      </span>
                      <span className={styles.numStyle}>127</span>
                    </p>
                  </div>
                  <h3 className={styles.profileHeading}>{item.postId.header}</h3>
                  <p className={styles.paraStyle}>{item.postId.bodyRichText}</p>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 2,
                    backgroundColor: "#707070",
                    opacity: 0.1,
                    marginTop: 7,
                  }}
                ></div>
              </div>
            );
          })} */}

{filteredBookmarkData.map((item, index) => {
  const isPost = item.post ? true : false;
  const headingClass = isPost ? styles.profileHeading : styles.commentHeading;
  const paraClass = isPost ? styles.paraStyle : styles.commentPara;
   const channelIconImageUrl = isPost 
    ? item.postChannel?.channelIconImageUrl 
    : item.postCommentChannel?.channelIconImageUrl;

  const imageUrl = channelIconImageUrl ? channelIconImageUrl : profileImage;
  
  return (
    <div key={item._id} className={styles.profileDetails}>
      <div className={styles.profileContent}>
        <div className={styles.alignCenter}>
          <Image
            src={imageUrl} 
            alt="channelImage"
            className={styles.smallImg}
            width={20}
            height={20}
          />
          &nbsp;
          <p className={styles.profileName}>
            {isPost ? item.postChannel.channelName : item.postCommentChannel.channelName}
          </p>
        </div>
        <div className={`${styles.alignCenter} ${styles.shareContainer}`}>
          <Image
            src={menuicon}
            alt="menuicon"
            style={{ cursor: "pointer" }}
            onClick={() => handleMenuIconClick(index)}
          />
          {showShareBox && selectedMenuIndex === index && (
            <div className={bookmarkStyle.shareBox}>
              {isShareSupported && (
                <button onClick={() => handleSharePost(item)}>SHARE</button>
              )}
            </div>
          )}
          &nbsp;&nbsp; &nbsp;&nbsp;
          <Image
            src={filledbookmark}
            alt="bookmark"
            style={{ cursor: "pointer" }}
            onClick={() => handleRemoveBookmarkClick(isPost ? 'post' : 'comment', isPost ? item.post?._id : item.postComment?._id)}
          />
          &nbsp;
        </div>
      </div>
      <div onClick={() => handleClick(isPost ? item.post._id : item.postCommentPost._id, isPost ? 'post' : 'comment')}>
      <div className={styles.aboutProfile}>
        <img
          src={isPost ? item.post.mainImageURL : item.postCommentPost.mainImageURL}
          alt="postImage"
          className={styles.imgStyle}
        />
      </div>
      <div>
        <div className={styles.miniContent}>
          <p className={styles.proInfo}>
            {isPost ? `${item.post.section} - ${item.post.subSection} ${FormatDate(item.post.createdAt)} min` : `${FormatDate(item.postComment?.createdAt)} min`}
            {isPost && (
              <>
                <span className={styles.chatIcons}>
                  <Image src={doublechat} alt="doublechat" />
                </span>
                <span className={styles.numStyle}>127</span>
              </>
            )}
          </p>
        </div>
        <h3 className={headingClass}>
          {isPost ? item.post.header : item.postComment.excerpt}
        </h3>
        <p className={paraClass}>
          {isPost ? item.post.bodyRichText : item.postComment.commentText}
        </p>
      </div>
      </div>
      <div
        style={{
          width: "100%",
          height: 2,
          backgroundColor: "#707070",
          opacity: 0.1,
          marginTop: 7,
        }}
      ></div>
    </div>
  );
})}

        </div>
        <div
          style={{
            width: "100%",
            height: 2,
            backgroundColor: "#707070",
            opacity: 0.1,
            marginTop: 7,
          }}
        ></div>
      </div>
    </>
  );
};

export default Bookmark;
