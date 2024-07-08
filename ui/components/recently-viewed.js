import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
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


const RecentlyViewed = ({ device }) => {

  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [showShareBox, setShowShareBox] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState(
    Array(profilesData.length).fill(false)
  );

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

  const handleBookmarkClick = (index) => {
    const newBookmarkStates = [...bookmarkStates];
    newBookmarkStates[index] = !newBookmarkStates[index];
    setBookmarkStates(newBookmarkStates);
  };

  const handleProfileClick = (profile) => {
    //setSelectedProfile(profile);
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

        <div className={styles.homeNav} style={{ marginTop: 0 }}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link
                href="/home"
                className={styles.linkStyle}
                
              >
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/recently-viewed" className={`${styles.linkStyle} ${styles.active}`}>
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

        <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:-3}}></div>
        

        <div className={styles.userProfileContainer}>
          <div className={styles.userProfileRow}>
            {profilesData.map((profile) => (
              <div
                key={profile.id}
                className={`${styles.profile}`}
                onClick={() => handleProfileClick(profile)}
              >
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  width="45px"
                  height="45px"
                />
                {profile.total && (
                  <div className={styles.totalBadge}>
                    <span>{profile.total}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {device === "mobile" &&

            <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:7}}></div>
          }
           


            <div>
              {profilesData.map((item, index) => {
                return (
                  <div key={item.id} className={styles.profileDetails}>
                    <div className={styles.profileContent}>
                      <div className={styles.alignCenter}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={styles.smallImg}
                        />

                        <span
                          className={styles.profileName}
                          style={{ marginLeft: 5, }}
                        >
                          {item.name}
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
                            <p>SHARE</p>
                          </div>
                        )}
                        
                        <Image
                          src={
                            bookmarkStates[index] ? filledbookmark : bookmark
                          }
                          alt="bookmark"
                          style={
                            device === "mobile"
                              ? { cursor: "pointer", width: 11, height: 15, marginLeft:25,  }
                              : { cursor: "pointer", width: 11, height: 15, marginLeft:25 }
                          }
                          onClick={() => handleBookmarkClick(index)}
                        />
                        
                      </div>
                    </div>
                    <div className={styles.aboutProfile}>
                      <img
                        src={item.dummyUrl}
                        alt={item.name}
                        className={styles.imgStyle}
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
                          Explore – Sri Lanka • Aug 21 • 7 min read 122
                          <span className={styles.chatIcons}>
                            <Image
                              src={doublechat}
                              alt="doublechat"
                              style={
                                device === "mobile"
                                  ? { cursor: "pointer", width: 17, height: 15,  }
                                  : {
                                      cursor: "pointer",
                                      width: 17,
                                      height: 15,
                                      marginLeft: 10,
                                    }
                              }
                            />
                          </span>
                          <span className={styles.numStyle}>127</span>
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
                      <h3 className={styles.profileHeading}>{item.heading}</h3>
                      <span className={styles.paraStyle}>{item.details}</span>
                    </div>
                    <div style={{width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1, marginTop:12}}></div>
                  </div>
                );
              })}
            </div>
          
        </div>
      </div>
    </>
  );
};

export default RecentlyViewed;
