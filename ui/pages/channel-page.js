import { useState } from "react";
import styles from "../styles/home.module.css";
import channelStyles from "../styles/channel-page.module.css";
import Image from "next/image";
import Link from "next/link";
import channelImg from "../public/images/joen.svg";
import channelImg1 from "../public/images/joen1.svg";
import chaticon from "../public/images/squarechat.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import menuicon from "../public/images/menu.svg";
import doublechat from "../public/images/doublechat.svg";
import community from "../public/images/community.svg";
import backarrow from "../public/images/backwardarrow.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import BottomNav from "../components/bottom-nav";

const channelPage = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={channelStyles.subheading}>
            <Image
              src={backarrow}
              alt="backarrow"
              className={channelStyles.backarrow}
            />
            <h1
              className={`${styles.boardingHead} ${channelStyles.boardingHead}`}
            >
              <Image
                src={channelImg}
                alt="channelImg"
                className={channelStyles.img}
                width="30px"
                height="30px"
              />
              &nbsp;Joel Booksz
            </h1>
          </div>

          <div className={channelStyles.totalCountingDiv}>
            <Image
              src={community}
              alt="community"
              className={styles.userIcon}
            />
            <span className={channelStyles.count}>23</span>
          </div>
        </div>
        <hr />
      </div>

      <div className={styles.container}>
        <div className={styles.homeNav}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link
                href="/channel-page"
                className={`${styles.linkStyle} ${styles.active}`}
              >
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/analysis" className={styles.linkStyle}>
                Analysis
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/blockchain" className={styles.linkStyle}>
                Blockchain
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/crypto" className={styles.linkStyle}>
                Crypto
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/ntfs" className={styles.linkStyle}>
                NTFs
              </Link>
            </li>
          </ul>
        </div>
        <hr />
      </div>

      <div className={channelStyles.aboutChannel}>
        <div className={channelStyles.parentBox}>
          <div className={channelStyles.childBox}>
            <Image
              src={channelImg1}
              alt="channelimage"
              width="59px"
              height="59px"
            />
          </div>
          <div className={channelStyles.childBox}>
            <h3 className={channelStyles.childhHeading}>Joel Booksz</h3>
            <p className={channelStyles.childParagraph}>@JoelBooksz</p>
            <p className={channelStyles.childDescription}>
              Editor-at-large for the world’s largest blockchain community – I
              like cats, but I love dogs.
            </p>
            <p className={channelStyles.childEmail}>versoview.com/joelbooksz</p>
          </div>
          <div className={channelStyles.childBox}>
            <button className={channelStyles.btn}>Following</button>
          </div>
        </div>
        <div className={channelStyles.parentBox}>
          <div className={channelStyles.contentBox_1}>
            <div className={channelStyles.messageBox}>
              <Image
                src={chaticon}
                alt="chaticon"
                className={channelStyles.chatImage}
              />
              <p className={channelStyles.message}>Message</p>
            </div>
          </div>
          <div className={channelStyles.contentBox_2}>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>7</p>
              <p className={channelStyles.contentStyle}>Posts</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>3</p>
              <p className={channelStyles.contentStyle}>Following</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>127</p>
              <p className={channelStyles.contentStyle}>Followers</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.userProfileContainer}>
          <div>
            {profilesData.map((item, index) => {
              return (
                <div key={index.id} className={styles.profileDetails}>
                  <div className={styles.profileContent}>
                    <div className={styles.alignCenter}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        width="20px"
                        height="20px"
                      />
                      &nbsp;
                      <p className={styles.profileName}>{item.name}</p>
                    </div>
                    <div className={styles.alignCenter}>
                      <Image src={menuicon} alt="menuicon" />
                      &nbsp;&nbsp;
                      <Image src={bookmark} alt="bookmark" />
                      &nbsp;
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
                    <div className={styles.miniContent}>
                      <p className={styles.proInfo}>
                        Opinion – Blockchain • Aug 23 • 8 min read
                        <span className={styles.chatIcons}>
                          <Image src={doublechat} alt="doublechat" />
                        </span>
                        12
                      </p>
                      <span className={styles.icons}>
                        <Image src={book} alt="book" />
                      </span>
                    </div>
                    <h3 className={styles.profileHeading}>{item.heading}</h3>
                    <p className={styles.paraStyle}>{item.details}</p>
                  </div>
                  <hr />
                </div>
              );
            })}
          </div>
        </div>
        <BottomNav activePage="profile" />
      </div>
    </>
  );
};

export default channelPage;
