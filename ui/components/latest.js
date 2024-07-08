import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import { useRouter } from 'next/router';
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import community from "../public/images/community-icon.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import doublechat from "../public/images/doublechat.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import divider from "../public/images/divider.svg";
import {getAllPost} from "../api/postApi";
import image1 from "../public/images/AnantaraSriLanka.png";
import image2 from "../public/images/aavegotchi.png";
import bookmarkApi from "../api/addBookmarks";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import removeBookmarkApi from "../api/removebookmark";
import {getAllChannelApi} from "../api/channelApi";
import filterPostApi from "../api/filterPostByTopics";
import profileImage from "../public/images/defaultProfile.svg";
import FormatDate from "./formateDate";
import getAllBookmarkApi from "../api/getAllBookmark";
import Loader from '../components/loader';
import ShimmerEffect from "./shimmer";
import {jwtDecode} from 'jwt-decode';
import {getUserByIdApi} from "../api/authApi";
import {getUnreadPostApi} from "../api/postApi";
import {unreadPostApi} from "../api/postApi";

const Latest = ({ device}) => {
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showShareBox, setShowShareBox] = useState(false);
  const [channels, setchannels] = useState([]);
  const [bookmarkStates, setBookmarkStates] = useState(
    []
  );
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [postImageLoading, setPostImageLoading] = useState({});
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState(1);
  const [lazyLoading, setLazyLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const fetchFromCache = async (request) => {
    const cache = await caches.open('api-cache-v1');
    const cachedResponse = await cache.match(request);
    if (!cachedResponse) return null;
    const responseData = await cachedResponse.json();
    return responseData;
  };
  
  const cacheData = async (request, data) => {
    const cache = await caches.open('api-cache-v1');
    await cache.put(request, new Response(JSON.stringify(data)));
  };

  const handleClick = () => {
    if (!authenticated) {
      router.push('/login');
    } 
  }
  
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


//   useEffect(() => {  

//     const fetchChannelData = async (userId) => {
//       try {
//         setLoading(true);
//         const request = new Request('/api/getAllChannel');
//         const cachedChannels = await fetchFromCache(request);
//         if (cachedChannels) {
//           setchannels(cachedChannels);
//         }

//         const channelData = await getAllChannelApi();
  
//         // Create a function to fetch unread post count for a channel
//         const fetchUnreadPostCount = async (channelId) => {
        
//           try {
//             const response = await getUnreadPostApi({ channelId, userId });
//             return response.data.length;
//           } catch (error) {
//             console.error(`Error fetching unread posts for channel ${channelId}:`, error);
//             return 0; 

// //       const fetchChannelData = async (userId) => {
// //         try {
// //           setLoading(true);
// //           const request = new Request('/api/getAllChannel');
// //           console.log(request)
// //           const cachedChannels = await fetchFromCache(request);
// //           if (cachedChannels) {
// //             setchannels(cachedChannels);
// // >>>>>>> main
//           }
  
//           const channelData = await getAllChannelApi();
    
//           // Create a function to fetch unread post count for a channel
//           const fetchUnreadPostCount = async (channelId) => {
//             try {
//               const response = await getUnreadPostApi({ channelId, userId });
//               return response.data.length;
//             } catch (error) {
//               console.error(`Error fetching unread posts for channel ${channelId}:`, error);
//               return 0; 
//             }
//           };
    
//           // Map over channelData to fetch unread post counts for each channel
//           const channelsWithUnreadPosts = await Promise.all(
//             channelData.map(async (item) => {
//               if (item.channelData?._id) {
//                 const unreadPostCount = await fetchUnreadPostCount(item.channelData?._id);
//                 return {
//                   ...item,
//                   unreadPostCount: unreadPostCount,
//                 };
//               }
//               return item;
//             })
//           );
          
//           setchannels(channelsWithUnreadPosts);
//           await cacheData(request, channelsWithUnreadPosts);
//         } catch (error) {
//           console.error('Error fetching channel data:', error);
//           setLoading(false);
//         }
//       };
    
//       fetchChannelData(userId); 
//     }, [userId]);
//           try {
//             const response = await getUnreadPostApi({ channelId, userId });
//             return response.data.length;
//           } catch (error) {
//             console.error(`Error fetching unread posts for channel ${channelId}:`, error);
//             return 0; 
//           }
//         };
  
//         // Map over channelData to fetch unread post counts for each channel
//         const channelsWithUnreadPosts = await Promise.all(
//           channelData.map(async (item) => {
//             if (item.channelData?._id) {
//               const unreadPostCount = await fetchUnreadPostCount(item.channelData?._id);
//               return {
//                 ...item,
//                 unreadPostCount: unreadPostCount,
//               };
//             }
//             return item;
//           })
//         );
        
//         setchannels(channelsWithUnreadPosts);
//         await cacheData(request, channelsWithUnreadPosts);
//       } catch (error) {
//         console.error('Error fetching channel data:', error);
//         setLoading(false);
//       }
//     };
//     // changes
//     fetchChannelData(userId); 
//   }, [userId]);

useEffect(() => {  
  const fetchChannelData = async (userId) => {
    try {
      setLoading(true);
      const request = new Request('/api/getAllChannel');
      const cachedChannels = await fetchFromCache(request);
      if (cachedChannels) {
        setchannels(cachedChannels);
      }

      const channelData = await getAllChannelApi();

      // Create a function to fetch unread post count for a channel
      const fetchUnreadPostCount = async (channelId) => {
      
        try {
          const response = await getUnreadPostApi({ channelId, userId });
          return response.data.length;
        } catch (error) {
          console.error(`Error fetching unread posts for channel ${channelId}:`, error);
          return 0; 
        }
      };

      // Map over channelData to fetch unread post counts for each channel
      const channelsWithUnreadPosts = await Promise.all(
        channelData.map(async (item) => {
          if (item.channelData?._id) {
            const unreadPostCount = await fetchUnreadPostCount(item.channelData?._id);
            return {
              ...item,
              unreadPostCount: unreadPostCount,
            };
          }
          return item;
        })
      );
      
      setchannels(channelsWithUnreadPosts);
      await cacheData(request, channelsWithUnreadPosts);
    } catch (error) {
      console.error('Error fetching channel data:', error);
      setLoading(false);
    }
  };
  // changes
  fetchChannelData(userId); 
}, [userId]);
  
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
        } else {
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleImageLoad = (id) => {
    setImageLoading((prevState) => {
      const newState = { ...prevState, [id]: false };
      setLoading(false);
      return newState;
    });
  };
  
  useEffect(() => {
    const filterPosts = async (selectedTopics) => {
      setLoading(true);
      const request = new Request('/api/filterPostApi'); 
      const filteredPosts = await fetchFromCache(request);

      if (filteredPosts) {
        setFilteredPosts(filteredPosts);
      }
      try {
        if (selectedTopics && selectedTopics.length > 0) {
          const filteredPostsResponse = await filterPostApi(selectedTopics);
          const bookmarkedPosts = await getAllBookmarkApi();
          
          const updateData = filteredPostsResponse.map((item) => {
            let isBookmarked = bookmarkedPosts.data.find(singleBookmark => singleBookmark.post && singleBookmark.post?._id === item._id);

            return { ...item, isBookmarked: isBookmarked ? true : false }
          });

          setFilteredPosts(updateData);
          await cacheData(request, updateData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error filtering posts:', error);
      }
    };

    filterPosts(selectedTopics);
  }, [selectedTopics]);

  const handlePostClick = async (postId) => {
    await unreadPostApi({postId});
    router.push(`/post-detail?postId=${postId}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      // setLoading(true);
      setLazyLoading(true); 

        try {
          const resp = await getAllPost(page);
          // setPosts(data);
          const newData =resp.data
          setPosts((prevPosts) => [...prevPosts, ...newData]);
          setHasMore(resp.currentPage < resp.totalPages);
          setLazyLoading(false); 
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
    };

    console.log('ss',page)
    fetchPosts();
  }, [page]);

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

  const handleBookmarkClick = async (postId) => {
    try {
      const response = await bookmarkApi("post", postId);
      if(response.data){
        setFilteredPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: true } : post));
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  };
  
  const handleRemoveBookmarkClick = async (postId) => {
    try {
      const response = await removeBookmarkApi("post", postId);
      if(response.status === 200){
        setFilteredPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, isBookmarked: false } : post));
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const handleChannelClick = (channelId) => {
    router.push({
        pathname: '/channel', 
        query: { channelId: channelId }
    });
  };
  
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop < (document.documentElement.offsetHeight-5) || lazyLoading || !hasMore) {
      return;
    }
    setPage((prevPage) => prevPage + 1);
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
         {loading ? (
          <ShimmerEffect />
         ) : (
      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.headContainer}>
            <Image
              src={logo}
              alt="logo"
              style={
                device === "mobile"
                  ? { width: 22, height: 18 }
                  : { width: 22, height: 18 }
              }
            />
            <span className={styles.boardingHead} style={{ marginLeft: 7 }}>
              Home
            </span>
          </div>
          <div className={styles.totalCountingDiv}>
            <Image
              src={community}
              alt="community"
              className={styles.userIcon}
            />
            <span className={styles.count}>23</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 1.5,
            backgroundColor: "#707070",
            opacity: 0.1,
          }}
        ></div>

        <div className={styles.homeNav} style={{ marginTop: 0 }}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link
                href="/home"
                className={`${styles.linkStyle} ${styles.active}`}
              >
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/recently-viewed" className={styles.linkStyle}>
                Recently viewed
              </Link>
            </li>
            {device === "mobile" ? (
              <li className={styles.listStyle}>
                <Link href="/following" className={styles.linkStyle}>
                  Following
                </Link>
              </li>
            ) : null}
          </ul>
        </div>

        <div
          style={{
            width: "100%",
            height: 2,
            backgroundColor: "#707070",
            opacity: 0.1,
            marginTop: -3,
          }}
        ></div>

        <div className={styles.userProfileContainer}>
          <div className={styles.userProfileRow}>
            {channels.map((item, index) => (
              <div
                key={item._id}
                className={`${styles.profile}`}
                onClick={() => handleChannelClick(item.channelData?._id)}
              >
                      <Image
                        src={item.channelData?.channelIconImageUrl || profileImage}
                        alt="channel image"
                        width={45}
                        height={45}
                      />
              
                {item.unreadPostCount != 0 && (
                  <div className={styles.totalBadge}>
                    <span>{item.unreadPostCount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {device === "mobile" && (
            <div
              style={{
                width: "100%",
                height: 2,
                backgroundColor: "#707070",
                opacity: 0.1,
                marginTop: 7,
              }}
            ></div>
          )}
          
          {selectedTopics.length > 0 ? (
          <div style={{paddingBottom : "60px"}}>
                {filteredPosts.length > 0 ? (
      filteredPosts.map((item, index) => (
        <div key={item._id} className={styles.profileDetails}>
          <div>
            <div className={styles.profileContent}>
              <div className={styles.alignCenter}>
                <Image
                  src={item.channelData?.data?.channelIconImageUrl || profileImage}
                  alt="image"
                  className={styles.smallImg}
                  fetchPriority="high"
                  width={20}
                  height={20}
                />
                <span className={styles.profileName} style={{ marginLeft: 5 }}>
                  {item.channelData?.data?.channelName}
                </span>
              </div>
              <div className={`${styles.alignCenter} ${styles.shareContainer}`}>
                <Image
                  src={menuicon}
                  alt="menuicon"
                  style={{ cursor: "pointer", width: 20, height: 3 }}
                  onClick={() => handleMenuIconClick(index)}
                  fetchPriority="high"
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
                  style={{ cursor: "pointer", width: 11, height: 15, marginLeft: 25 }}
                  onClick={() =>
                    item.isBookmarked
                      ? handleRemoveBookmarkClick(item._id)
                      : handleBookmarkClick(item._id)
                  }
                />
              </div>
            </div>
            <div onClick={() => handlePostClick(item._id)}>
              <div className={styles.aboutProfile}>
                <img src={item.mainImageURL} alt="image" className={styles.imgStyle} />
              </div>
              <div>
                <div className={styles.miniContent} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <p className={styles.proInfo}>
                    {item.section || ""} - {item.subSection || ""} {FormatDate(item.createdAt)} min read 09
                    <span className={styles.chatIcons}>
                      <Image
                        src={doublechat}
                        alt="doublechat"
                        style={{ cursor: "pointer", width: 17, height: 15 }}
                      />
                    </span>
                    <span className={styles.numStyle}>09</span>
                  </p>
                  <span className={styles.icons}>
                    <Image
                      src={book}
                      alt="book"
                      style={{ cursor: "pointer", width: 16, height: 14, marginTop: -5 }}
                    />
                  </span>
                </div>
                <h3 className={styles.profileHeading}>{item.header}</h3>
                <p className={styles.standFirst}>{item.standFirst}</p>
                <p className={styles.paraStyle}>{item.bodyRichText}</p>
              </div>
            </div>
            <div style={{ width: "100%", height: 2, backgroundColor: "#707070", opacity: 0.1, marginTop: 12 }}></div>
          </div>
        </div>
      ))
    ) : (
      <div className={styles.noPosts}>
        <p>No posts available</p>
      </div>
    )}
          </div>
          ):(  
          <div style={{paddingBottom: "60px"}}>
          {posts.map((item, index) => {
            return (
              <div key={item._id} className={styles.profileDetails}>
                <div>
                <div className={styles.profileContent}>
                  <div className={styles.alignCenter}>
                    <Image
                      src={item.channelId?.channelIconImageUrl || profileImage}
                      alt="image"
                      className={styles.smallImg}
                      width={20}
                      height={20}
                    />

                    <span
                      className={styles.profileName}
                      style={{ marginLeft: 5 }}
                    >
                      {item.channelId?.channelName}
                    </span>
                  </div>

                  <div
                    className={`${styles.alignCenter} ${styles.shareContainer}`}
                  >
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      style={
                        device === "mobile"
                          ? { cursor: "pointer", width: 20, height: 3 }
                          : { cursor: "pointer", width: 20, height: 3 }
                      }
                      onClick={() => handleMenuIconClick(index)}
                    />
                    {showShareBox && selectedMenuIndex === index && (
                      <div className={styles.shareBox}>
                        {isShareSupported && (
                            <button onClick={handleClick}>SHARE</button>
                        )}
                      </div>
                    )}

                    <Image
                      src={
                        bookmark
                      }
                      alt="bookmark"
                      onClick={handleClick}
                      style={
                        device === "mobile"
                          ? {
                              cursor: "pointer",
                              width: 11,
                              height: 15,
                              marginLeft: 25,
                            }
                          : {
                              cursor: "pointer",
                              width: 11,
                              height: 15,
                              marginLeft: 25,
                            }
                      }
                    />
                  </div>
                </div>
                <div onClick={() => handlePostClick(item._id)}>
                <div className={styles.aboutProfile}>
                  <img
                    src={item.mainImageURL}
                    alt="image"
                    className={styles.imgStyle}
                    // onClick={() => handlePostClick(item._id)}
                  />
                </div>
                <div>
                  <div
                    className={styles.miniContent}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <p className={styles.proInfo}>
                    {item.section} - {item.subSection || ""} {FormatDate(item.createdAt)} min read 09
                      <span className={styles.chatIcons}>
                        <Image
                          src={doublechat}
                          alt="doublechat"
                          style={
                            device === "mobile"
                              ? { cursor: "pointer", width: 17, height: 15 }
                              : {
                                  cursor: "pointer",
                                  width: 17,
                                  height: 15,
                                  marginLeft: 10,
                                }
                          }
                          onClick={handleClick}
                        />
                      </span>
                      <span className={styles.numStyle}>09</span>
                    </p>
                    <span className={styles.icons}>
                      <Image
                        src={book}
                        alt="book"
                        style={
                          device === "mobile"
                            ? {
                                cursor: "pointer",
                                width: 16,
                                height: 14,
                                marginTop: -5,
                              }
                            : {
                                cursor: "pointer",
                                width: 16,
                                height: 14,
                                marginTop: -5,
                              }
                        }
                      />
                    </span>
                  </div>
                  <h3 className={styles.profileHeading}>{item.header}</h3>
                  <span className={styles.paraStyle}>
                    {item.bodyRichText}
                  </span>
                </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 2,
                    backgroundColor: "#707070",
                    opacity: 0.1,
                    marginTop: 12,
                  }}
                ></div>
              </div>
              </div>
            );
          })}
          <div
                  style={{
                    marginTop: 10,
                  }}
                ></div>
          {lazyLoading && <Loader type={'clipdark'}/>}

        </div>
           )}
        </div>
      </div>
)}</>
    
  );
};

// latest modify
export default Latest;
  
  