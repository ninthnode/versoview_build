import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import PostDetail from "../components/post-detail";

const PostDetailPage = () => {

  return (
    <>
      <div className={globalStyles.onlyMobileBlock}>
        <PostDetail device="mobile" />
        <BottomNav activePage="home" />
      </div>

      <div
        className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}
      >
        <div className={styles.parentContainer}>
          <div className={styles.leftNavbar}>
            <DesktopLeftNav activePage="profile" />
          </div>
          <div className={styles.homeSection}>
            <PostDetail device="desktop" />
          </div>
          <div className={styles.section3}>
            <div className={styles.homeContent}>
              <MyChats device="desktop" />
              <Following device="desktop" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
