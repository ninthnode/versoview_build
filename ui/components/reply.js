import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import chatsStyle from "../styles/chats.module.css";
import mydmsStyle from "../styles/mydms.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import search from "../public/images/search1.svg";
import community from "../public/images/community.svg";
import chatimg1 from "../public/images/chatimg1.svg";
import chatimg2 from "../public/images/chatimg2.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import backarrow from "../public/images/backwardarrow.svg";
import ChatData from "../chatData.json";

import { useRouter } from 'next/router';


const Reply = ({ device }) => {
  
  const [showShareBox, setShowShareBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [bookmarkStates, setBookmarkStates] = useState(
    Array(ChatData.length).fill(false)
  );

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

  const handleBookmarkClick = (index) => {
    const newBookmarkStates = [...bookmarkStates];
    newBookmarkStates[index] = !newBookmarkStates[index];
    setBookmarkStates(newBookmarkStates);
  };

  const handleMenuIconClick = (index) => {
    console.log("clicked");
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

  return (
    <>
      <div className={styles.container}>
        {device === "mobile" ? null : (
          <div style={{ marginTop: "36px" }}>
            <Image src={search} alt="searchIcon" />
            <span>
              <input
                type="text"
                placeholder="Search"
                className={chatsStyle.searchInput}
              />
            </span>
          </div>
        )}

        <div style={{width: "100%", height: 1.5, backgroundColor: '#707070', opacity: 0.1}}></div>

        <div className={styles.heading}>
          <span
            style={
              device === "desktop"
                ? { marginTop: "-5px", marginBottom: "26px" }
                : null
            }
            className={styles.boardingHead}
          >
            {device === "mobile" ? <Image src={logo} alt="logo" /> : null}
            &nbsp;{device === "desktop" ? "My Chats" : "Chats"}
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
          style={
            device === "mobile"
              ? { height: 1, backgroundColor: "#70707019", marginTop: 10 }
              : null
          }
        />

        <div
          style={
            device === "desktop"
              ? {
                  border: "1px solid rgb(176, 173, 173)",
                  height: "336px",
                  padding: "0px 20px",
                  overflowY: "auto",
                }
              : null
          }
        >
          <div className={styles.homeNav}>
            <ul className={`${styles.navbar} ${chatsStyle.navbar}`}>
              {device === "mobile" ? (
                <Image
                  src={backarrow}
                  alt="backarrow"
                  className={chatsStyle.backarrow}
                />
              ) : null}
              <li className={styles.listStyle}>
                <Link
                  href="/chats"
                  style={
                    device === "desktop"
                      ? {
                          textDecoration: "none",
                          color: "#000000",
                          position: "relative",
                          paddingBottom: "12.4px",
                          marginLeft: "0px",
                        }
                      : null
                  }
                  className={chatsStyle.linkStyle}
                >
                  My chats
                </Link>
              </li>
              <li className={styles.listStyle}>
                <Link
                  href="/mydms"
                  style={
                    device === "desktop"
                      ? {
                          textDecoration: "none",
                          color: "#000000",
                          position: "relative",
                          paddingBottom: "12.4px",
                          marginLeft: "-8px",
                        }
                      : null
                  }
                  className={`${chatsStyle.linkStyle} ${chatsStyle.active}`}
                >
                  My DMs
                </Link>
                <span className={chatsStyle.totalChat}>23</span>
              </li>
            </ul>
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: "#70707019",
              marginTop: 2,
              marginBottom: 10,
            }}
          />

          <div>
            {ChatData.map((item, index) => {
              return (
                <div key={item.id}>
                  <div className={chatsStyle.channelBar}>
                    <div className={chatsStyle.channelName}>
                      <Image
                        src={chatimg2}
                        alt="chatimg2"
                        width="36px"
                        height="36px"
                      />
                      <span>
                        <span className={chatsStyle.title}>{item.title}</span>
                        <p className={chatsStyle.subTitle}>Nov 8&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;2:53 pm</p>
                      </span>
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
                        <div className={chatsStyle.shareBox}>
                          <p>SHARE</p>
                        </div>
                      )}
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <Image
                        src={bookmarkStates[index] ? filledbookmark : bookmark}
                        alt="bookmark"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleBookmarkClick(index)}
                      />
                    </div>
                  </div>
                  <div className={chatsStyle.chatBox}>
                    <div
                      style={
                        device === "desktop"
                          ? { marginTop: "2px", width: "73%" }
                          : null
                      }
                      className={chatsStyle.chatSenderContentBox}
                    >
                      <p>{item.senderChat}</p>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div className={mydmsStyle.messageTime}>
                        <span className={mydmsStyle.date}>
                            Date&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;7:03 pm
                        </span>
                      </div>
                    </div>
                    <div
                      style={
                        device === "desktop"
                          ? { marginTop: "2px", width: "73%" }
                          : null
                      }
                      className={chatsStyle.chatRecieverContentBox}
                    >
                      <p>{item.recieverChat}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className={mydmsStyle.messageTime}>
                        <span className={mydmsStyle.date}>
                            Date&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;7:03 pm
                        </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reply;
