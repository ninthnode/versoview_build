import { useState } from "react";
import styles from "../styles/home.module.css";
import channelStyles from "../styles/home-beautiful.module.css";
import Image from "next/image";
import Link from "next/link";
import channelImg from "../public/images/home1.svg";
import channelImg3 from "../public/images/home2.svg";
import chaticon from "../public/images/squarechat.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import menuicon from "../public/images/menu.svg";
import doublechat from "../public/images/doublechat.svg";
import backarrow from "../public/images/backwardarrow.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import BottomNav from "../components/bottom-nav";

const homeBeautiful = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={channelStyles.heading}>
          <Image src={backarrow} alt="backarrow" className={styles.backarrow} />
          <Image
            src={channelImg}
            alt="channelImg"
            className={channelStyles.img}
            width="30px"
            height="30px"
          />
          <h1
            className={`${styles.boardingHead} ${channelStyles.boardingHead}`}
          >
            &nbsp;Home Beautiful
          </h1>
        </div>
        <hr />
      </div>

      <div className={styles.container}>
        <div className={styles.homeNav}>
          <ul className={styles.navbar}>
            <li className={styles.listStyle}>
              <Link
                href="/home-beautiful"
                className={`${styles.linkStyle} ${styles.active}`}
              >
                Latest
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/entertaining" className={styles.linkStyle}>
                Entertaining
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/trends" className={styles.linkStyle}>
                Trends
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/travel" className={styles.linkStyle}>
                Travel
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/style" className={styles.linkStyle}>
                Style
              </Link>
            </li>
            <li className={styles.listStyle}>
              <Link href="/design" className={styles.linkStyle}>
                Design
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
              src={channelImg3}
              alt="channelimage"
              width="59px"
              height="59px"
            />
          </div>
          <div className={channelStyles.childBox}>
            <h3 className={channelStyles.childhHeading}>Home Beautiful</h3>
            <p className={channelStyles.childParagraph}>@HomeBeautifulAus</p>
            <p className={channelStyles.childDescription}>
              Connecting homes and hearts for 95 years, Home Beautiful is the
              most established and respected premium home improvement brand in
              Australia.
            </p>
            <p className={channelStyles.childEmail}>homebeautiful.com.au</p>
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
              <p className={channelStyles.contentStyle}>Editions</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>27</p>
              <p className={channelStyles.contentStyle}>Articles</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>6</p>
              <p className={channelStyles.contentStyle}>Following</p>
            </div>
            <div className={channelStyles.box}>
              <p className={channelStyles.numStyle}>1275</p>
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
        <BottomNav active="profile" />
      </div>
    </>
  );
};

export default homeBeautiful;
