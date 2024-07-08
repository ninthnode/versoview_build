import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import globalStyles from "../styles/global.module.css";
import Head from 'next/head';

const Chats = () => {

  return (
    <>
      <Head>
        <title>Versoview-MyChats</title>
      </Head>
        <div className={globalStyles.onlyMobileBlock}>
          <MyChats device="mobile" />
          <BottomNav activePage="home" />
        </div>
      
        <div className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="home" />
            </div>
            <div className={styles.homeSection}>
              <Latest device="desktop" />
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

export default Chats;
