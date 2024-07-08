import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import BottomNav from "../components/bottom-nav";
import RecentlyViewed from "../components/recently-viewed";
import DesktopLeftNav from "../components/left-navbar";
import MyChats from "../components/mychats";
import Following from "../components/following";

const Recentlyviewed = () => {

  return (
    <>
        <div className={globalStyles.onlyMobileBlock}>
          <RecentlyViewed device="mobile" />
          <BottomNav activePage="home" />
        </div>
      
        <div className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="home" />
            </div>
            <div className={styles.homeSection}>
              <RecentlyViewed device="desktop" />
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

export default Recentlyviewed;
