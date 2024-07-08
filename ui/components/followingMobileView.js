import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import followingStyle from "../styles/following.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import community from "../public/images/community.svg";
import menuicon from "../public/images/menu.svg";
import downarrow from "../public/images/downarrow.svg";
import uparrow from "../public/images/uparrow.svg";
import star from "../public/images/outlinestar.svg";
import filledstar from "../public/images/filledstar.svg";
import img from "../public/images/following.png";
import dummyData from "../dummyData.json";
import BottomNav from "../components/bottom-nav";
import {getChannelByName} from "../api/authApi"
import {FollowChannelList,pinnedChannelApi,unfollowChannelApi,unpinnedChannelApi} from "../api/channelApi";
import profileImage from "../public/images/defaultProfile.svg";
import {getUnreadPostApi} from "../api/postApi";

const FollowingMobileView = ({ device }) => {
  const [selectedSorting, setSelectedSorting] = useState(null);
  const [sortedChannels, setSortedChannels] = useState([]);
  const [showShareBox, setShowShareBox] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [channelData, setChannelData] = useState({});
  const [followingChannel, setFollowingChannel] = useState([]);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [starState, setStarState] = useState(
    Array(followingChannel.length).fill(false)
  );
  const channelId = channelData._id;

  console.log(followingChannel, "following channel list----")

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleShareChannel = async (item) => {
    try {
      const shareData = {
        url: `https://versoview.currlybraces.com/channel?channelId=${item}`, 
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
  
  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowBox(true);
  };

  const handleMenuClick = () => {
    setShowShareBox(true);
  };

  const handlePinnedClick = async (channelId) => {
    const response = await pinnedChannelApi({channelId});
    if(response.status === 200){
      const update = followingChannel.map(item => {
        if(item.channelId._id === channelId){
          return {...item, pinned : true};
        }
        return item;
      })
      setFollowingChannel(update);
    }
  };

  const handleunPinnedClick = async (channelId) => {
    const response = await unpinnedChannelApi({channelId});
    if(response === 200){
      const update = followingChannel.map(item => {
        if(item.channelId._id === channelId){
          return {...item, pinned : false};
        }
        return item;
      })
      setFollowingChannel(update);
    }
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (showShareBox && !event.target.closest(`.${followingStyle.popupContainer}`) && !event.target.closest(`.${followingStyle.arrowIcon}`)) {
  //     setShowBox(false);
  //     setSelectedMenuIndex(null);
  //   }
  // };

  //   document.addEventListener("click", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, [showShareBox]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showShareBox && !event.target.closest(`.${followingStyle.popupContainer}`) && !event.target.closest(`.${followingStyle.arrowIcon}`)) ||
        (showBox && !event.target.closest(`.${followingStyle.popupShow}`) && !event.target.closest(`.${followingStyle.menuIcon}`))
      ) {
        setShowShareBox(false);
        setShowBox(false);
        setSelectedMenuIndex(null);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showShareBox, showBox]);
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const channelData = async () => {
      try{ 
        const response = await getChannelByName();
        setChannelData(response);
      } catch(error){
        console.log(error);
      }
    } 
    channelData();
  },[])

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const followingChannelData = async () => {
      try { 
        const channelData = await FollowChannelList();
      
        // ranu
        const fetchUnreadPostCount = async (channelId) => {
          try {
            const response = await getUnreadPostApi({ channelId });
            return response.data.length;
          } catch (error) {
            console.error(`Error fetching unread posts for channel ${channelId}:`, error);
            return 0; 
          }
        };
  
        // Map over channelData to fetch unread post counts for each channel
        const channelsWithUnreadPosts = await Promise.all(
          channelData.data.map(async (item) => {
            if (item.channelId?._id) {
              const unreadPostCount = await fetchUnreadPostCount(item.channelId?._id);
              return {
                ...item,
                unreadPostCount: unreadPostCount,
              };
            }
            return item;
          })
        );
  
        // setchannels(channelsWithUnreadPosts);
        // /ranu
        
        setFollowingChannel(channelsWithUnreadPosts);

      } catch(error) {
        console.log(error);
      }
    } 
    followingChannelData();
  }, []);

  const followingChannelData = async () => {
    try { 
      const response = await FollowChannelList();
      setFollowingChannel(response.data);
    } catch(error) {
      console.log(error);
    }
  } 

  const handleUnfollow = async (channelId) => {
    await unfollowChannelApi({channelId});
    followingChannelData();
    setShowBox(false);
  }

  const handleSorting = (sortingType) => {
    setSelectedSorting(sortingType);
    if (sortingType === "A-Z") {
      const sortedData = [...followingChannel].sort((a, b) => {
        const channelNameA = a.channelId ? a.channelId.channelName : "";
        const channelNameB = b.channelId ? b.channelId.channelName : "";
        return channelNameA.localeCompare(channelNameB);
    });
      setSortedChannels(sortedData);
    } else if (sortingType === "RECENT") {
      const sortedData = [...followingChannel].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setSortedChannels(sortedData);
    } else if (sortingType === "BY GENRE") {
      const sortedData = [...followingChannel].sort((a, b) => {
        const channelNameA = a.channelId ? a.channelId.genre : "";
        const channelNameB = b.channelId ? b.channelId.genre : "";
        return channelNameA.localeCompare(channelNameB);
      });
      setSortedChannels(sortedData);
    } else if (sortingType === "PINNED") {
      const pinnedPosts = [...followingChannel].filter(item => item.pinned);
      const nonPinnedPosts = [...followingChannel].filter(item => !item.pinned);
      setSortedChannels([...pinnedPosts, ...nonPinnedPosts]);
    }
  };
  
  return (
    <>
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
            <span className={styles.boardingHead} style={{marginLeft:7}}>
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

        <div style={{width: "100%", height: 1.5, backgroundColor: '#707070', opacity: 0.1}}></div>

        <div className={styles.homeNav}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link href="/home" className={styles.linkStyle}>
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/recently-viewed" className={styles.linkStyle}>
                Recently Viewed
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link
                href="/following"
                className={`${styles.linkStyle} ${styles.active}`}
              >
                Following
              </Link>
            </li>
          </ul>
        </div>
        
        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:-3}}></div>

        <div className={followingStyle.channelBar}>
          <div className={followingStyle.channelName}>
            <Image 
            src={channelData.channelIconImageUrl ? channelData.channelIconImageUrl : profileImage}
            alt="img" width={50} height={50} style={{borderRadius: "5px"}}/>
            
            <span>
              <p className={followingStyle.title} style={{marginLeft: "10px"}}>{channelData.channelName}</p>
              <p className={followingStyle.subTitle} style={{marginLeft: "10px"}}>{channelData.genre}</p>
            </span>
          </div>
          <Image
            src={menuicon}
            alt="menuicon"
            className={followingStyle.menuIconMain}
          />
        </div>

        {device === "mobile" &&
            <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:15}}></div>
        }

        <div className={followingStyle.viewContent}>
          <span className={followingStyle.paraStyle}>VIEW BY</span>
          <Image
            src={downarrow}
            alt="arrow"
            className={followingStyle.arrowIcon}
            onClick={handleMenuClick}
          />
        </div>

        {showShareBox && (
                            <div className={followingStyle.popupContainer}>
                              <div className={followingStyle.popup}>
                                <div className={followingStyle.popupStyle} onClick={() => handleSorting("PINNED")}>
                                  PINNED
                                </div>

                                <div
                                  style={{
                                    border: "1px solid #70707019",
                                    marginTop: "5px",
                                    marginBottom: "5px"
                                  }}
                                >
                                </div>

                                <div className={followingStyle.popupStyle} onClick={() => handleSorting("BY GENRE")}>
                                  BY GENRE
                                </div>
                                
                                <div
                                  style={{
                                    border: "1px solid #70707019",
                                    marginTop: "5px",
                                    marginBottom: "5px"
                                  }}
                                >
                                </div>

                                <div className={followingStyle.popupStyle}>
                                  <div style={{ display: "flex", cursor:"pointer" }} onClick={() => handleSorting("A-Z")}>
                                    A-Z
                                    <Image
                                      src={uparrow}
                                      alt="uparrow"
                                      className={followingStyle.arrowStyle}
                                    />
                                    <Image
                                      src={downarrow}
                                      alt="downarrow"
                                      className={followingStyle.arrowStyle1}
                                    />
                                  </div>
                                </div>
                                
                                <div
                                  style={{
                                    border: "1px solid #70707019",
                                    marginTop: "5px",
                                    marginBottom: "5px"
                                  }}
                                >
                                </div>

                                <div className={followingStyle.popupStyle}>
                                  <div style={{ display: "flex", cursor:"pointer" }} onClick={() => handleSorting("RECENT")}>
                                    RECENT
                                    <Image
                                      src={uparrow}
                                      alt="uparrow"
                                      className={followingStyle.arrowStyle}
                                    />
                                    <Image
                                      src={downarrow}
                                      alt="downarrow"
                                      className={followingStyle.arrowStyle1}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
        )} 

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:-2, marginBottom:6}}></div>

        <div style={{paddingBottom: "60px"}}>
          {(sortedChannels && sortedChannels.length > 0 ? sortedChannels : followingChannel)?.map((item, index) => {
              return (
                <div key={item._id}>
                  <div className={followingStyle.content}>
                    <div className={followingStyle.displayFlex}>
                    <Image
                      src={item.pinned ? filledstar : star}
                      alt="star"
                      onClick={() => {
                        item.pinned ? 
                          handleunPinnedClick(item.channelId._id) : 
                          handlePinnedClick(item.channelId._id);
                      }}
                      className={followingStyle.starIcon}
                    />
                      <div className={followingStyle.positionRelative}>
                        <Image
                          src={item.channelId.channelIconImageUrl ? item.channelId.channelIconImageUrl : profileImage}
                          alt="img"
                          width={50}
                          height={50}
                          className={followingStyle.imageStyling}
                        />
                        {item.unreadPostCount > 0 && (
                          <p className={followingStyle.totalview}>{item.unreadPostCount}</p>
                        )}
                      </div>
                    </div>
                    <div className={followingStyle.displayFlex1}>
                      <div>
                        <span>
                          <p className={followingStyle.title}>{item.channelId.channelName}</p>
                          <p className={followingStyle.subTitle}>
                            {item.channelId.genre}
                          </p>
                        </span>
                      </div>
                      <div className={styles.shareContainer}>
                        <Image
                          src={menuicon}
                          alt="menuicon"
                          onClick={() => handleMenuIconClick(index)}
                          className={followingStyle.menuIcon}
                        />
                        {/* {starState[index] === false && */}
                          {showBox &&
                           selectedMenuIndex === index &&
                           (
                            <div className={followingStyle.popupContainer}>
                              <div className={followingStyle.popupShow}>
                                <div className={followingStyle.popupStyle}>
                                {isShareSupported && (
                                  <button onClick={() => handleShareChannel(item.channelId?._id)} className={followingStyle.sharebtn}>SHARE</button>
                                )}
                                </div>
                                <hr />
                                <div className={followingStyle.popupStyle} onClick={() => handleUnfollow(item.channelId?._id)}>
                                  UNFOLLOW
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div style={{width: "100%", height: 1, backgroundColor: '#707070', opacity: 0.1, marginTop:4, marginBottom:4}}></div>

                </div>
              );
            })}
        </div>
        <BottomNav activePage="home" />
      </div>
    </>
  );
};

export default FollowingMobileView;
