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
import {getChannelByName} from "../api/authApi"
import {followChannelList,pinnedChannelApi,unpinnedChannelApi} from "../api/channelApi";
import profileImage from "../public/images/defaultProfile.svg";

const Following = ({ device }) => {
  const [selectedSorting, setSelectedSorting] = useState(null);
  const [sortedChannels, setSortedChannels] = useState([]);
  const [showShareBox, setShowShareBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [channelData, setChannelData] = useState({});
  const [followingChannel, setFollowingChannel] = useState([]);
  const [starState, setStarState] = useState(
    Array(followingChannel.length).fill(false)
  );

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareBox && !event.target.closest(`.${followingStyle.popupContainer}`) && !event.target.closest(`.${followingStyle.arrowIcon}`)) {
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
        const response = await followChannelList();
        setFollowingChannel(response.data);
      } catch(error) {
        console.log(error);
      }
    } 
    followingChannelData();
  }, []);

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
          <span
            style={{ marginTop: '25%', marginBottom: 10 }}
            className={styles.boardingHead1}
          >
            {device === "mobile" ? <Image src={logo} alt="logo" /> : null}
            Following
          </span>
          {device === "mobile" ? (
            <div className={styles.totalCountingDiv}>
              <Image
                src={community}
                alt="community"
                className={styles.userIcon}
              />
              <span className={styles.count}>23</span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            border: "2px solid #70707019",
            height: "70%",
            padding: "0px 20px",
            overflowY: "auto",
          }}
        >
          <div className={styles.homeNav}>
            <ul className={styles.navbar}>
              {device === "mobile" ? (
                <>
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
                </>
              ) : null}
              <li className={styles.listStyle}>
                <Link href="/following" className={`${styles.linkStyle1}`} style={{fontSize:12, fontFamily:'SF-Bold', fontWeight:'bold'}}>
                  Following
                </Link>
              </li>
            </ul>
          </div>

          <div
            style={
              device === "mobile"
                ? {
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 0,
                    marginBottom: 10,
                  }
                : {
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: -10,
                    marginBottom: 1,
                  }
            }
          />

          <div className={followingStyle.channelBar}>
            {device === "mobile" ? (
              <>
                  <div className={followingStyle.channelName}>
                    <Image src={channelData.channelIconImageUrl} alt="img"width={50} height={50} />
                    <span>
                      <p className={followingStyle.title}>{item.channelId.channelName}</p>
                      <p className={followingStyle.subTitle}>{item.channelId.genre}</p>
                    </span>
                  </div>
                <Image
                  src={menuicon}
                  alt="menuicon"
                  style={{ cursor: "pointer" }}
                  className={followingStyle.menuIconMain}
                />
              </>
            ) : null}
          </div>

          <div className={followingStyle.viewContent} style={{position: "relative"}}>
            <span className={followingStyle.paraStyle} style={{fontSize:12, fontFamily:'SF-Bold'}}>VIEW BY</span>
            <Image
               src={downarrow}
               alt="arrow"
               className={followingStyle.arrowIcon}
               onClick={handleMenuClick}
            />
                      {showShareBox && (
                            <div className={followingStyle.popupContainer}>
                              <div className={followingStyle.DesktopPopup}>
                                <div className={followingStyle.popupStyle} onClick={() => handleSorting("PINNED")} style={{cursor:"pointer"}}>
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
                                
                                <div className={followingStyle.popupStyle} onClick={() => handleSorting("BY GENRE")} style={{cursor:"pointer"}}>
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
                                  <div style={{ display: "flex",cursor:"pointer" }} onClick={() => handleSorting("A-Z")}>
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
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: "#70707019",
              marginTop: 0,
              marginBottom: 10,
            }}
          />

<div style={{paddingBottom: "60px"}}>
          {(sortedChannels && sortedChannels.length > 0 ? sortedChannels : followingChannel)?.map((item, index) => {
                return (
                  <div key={item._id}>
                    <div className={followingStyle.content}>
                      <div
                        style={{ marginRight: "12px" }}
                        className={followingStyle.displayFlex}
                      >
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
                            style={
                              device === "desktop" ? { left: "-17px" } : null
                            }
                            width={50}
                            height={50}
                            className={followingStyle.imageStyling}
                          />
                          {item.view && (
                            <p
                              style={
                                device === "desktop" ? { left: "1px" } : null
                              }
                              className={followingStyle.totalview}
                            >
                              7k+
                            </p>
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
                            style={{ cursor: "pointer" }}
                            onClick={() => handleMenuIconClick(index)}
                            className={followingStyle.menuIcon}
                          />
                          {starState[index] === false &&
                            showShareBox &&
                            selectedMenuIndex === index && (
                              <div className={followingStyle.popupContainer}>
                                <div className={followingStyle.popup}>
                                  <div className={followingStyle.popupStyle}>
                                    PINNED
                                  </div>
                                  <hr />
                                  <div className={followingStyle.popupStyle}>
                                    BY GENRE
                                  </div>
                                  <hr />
                                  <div className={followingStyle.popupStyle}>
                                    <div style={{ display: "flex" }}>
                                      A-Z
                                      <Image
                                        src={uparrow}
                                        alt="uparrow"
                                        style={{ cursor: "pointer" }}
                                        className={followingStyle.arrowStyle}
                                      />
                                      <Image
                                        src={downarrow}
                                        alt="downarrow"
                                        style={{ cursor: "pointer" }}
                                        className={followingStyle.arrowStyle1}
                                      />
                                    </div>
                                  </div>
                                  <hr />
                                  <div className={followingStyle.popupStyle}>
                                    <div style={{ display: "flex" }}>
                                      RECENT
                                      <Image
                                        src={uparrow}
                                        alt="uparrow"
                                        style={{ cursor: "pointer" }}
                                        className={followingStyle.arrowStyle}
                                      />
                                      <Image
                                        src={downarrow}
                                        alt="downarrow"
                                        style={{ cursor: "pointer" }}
                                        className={followingStyle.arrowStyle1}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        height: 1,
                        backgroundColor: "#70707019",
                        marginTop: 0,
                        marginBottom: 12,
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Following;

