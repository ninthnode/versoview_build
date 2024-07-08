import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";
import chatsStyle from "../styles/chats.module.css";
import mydmsStyle from "../styles/mydms.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import community from "../public/images/community.svg";
import chatimg1 from "../public/images/chatimg1.svg";
import chatimg2 from "../public/images/chatimg2.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import menuicon from "../public/images/menu.svg";
import backarrow from "../public/images/backwardarrow.svg";
import BottomNav from "../components/bottom-nav";
import search from "../public/images/search1.svg";
import dummyData from "../mydmsDummyData.json";

const Mydms = ({ device }) => {

  
  const router = useRouter();

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

        <div
          style={
            device === "desktop"
              ? {
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 0,
                  marginBottom: 10,
                }
              : null
          }
        />
        <div className={styles.heading}>
          <h1
            style={
              device === "desktop"
                ? { marginTop: "-5px", marginBottom: "26px" }
                : null
            }
            className={styles.boardingHead}
          >
            {device === "mobile" ? <Image src={logo} alt="logo" /> : null}
            &nbsp;{device === "desktop" ? "My Chats" : "Chats"}
          </h1>
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
              ? {
                  height: 1,
                  backgroundColor: "rgba(112, 112, 112, 0.2)",
                  marginTop: 10,
                }
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
          {dummyData.map((item, index) => {
            return (
              <div key={item.id}>
                <div className={mydmsStyle.outerContainer}>
                  <div className={chatsStyle.channelBar}>
                    <div className={chatsStyle.channelName}>
                      <Image
                        src={chatimg2}
                        alt="chatimg2"
                        style={
                          device === "desktop" ? { paddingLeft: "19px" } : null
                        }
                        className={mydmsStyle.img}
                      />
                      <span className={mydmsStyle.title}>{item.title}</span>
                    </div>
                  </div>
                </div>
                <div className={mydmsStyle.outerMessageBox}>
                  <div
                    style={device === "desktop" ? { width: "70%" } : null}
                    className={mydmsStyle.messageBox}
                  >
                    <span className={mydmsStyle.textRegular}>{item.chat}</span>
                  </div>

                  <div className={mydmsStyle.messageTime}>
                    <span className={mydmsStyle.date}>{item.date}</span>
                    <span
                      className={mydmsStyle.reply}
                      // onClick={showChatScreen}
                    >
                      Reply
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Mydms;
