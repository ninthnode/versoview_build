import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import Explore from "../components/explore";
import { ToastContainer } from "react-toastify";
import Head from 'next/head';

const Explore1 = () => {

  return (
    <>
      <Head>
        <title>Versoview-Explore</title>
      </Head>
        <div className={globalStyles.onlyMobileBlock}>
          <Explore device="mobile" />
          <BottomNav activePage="explore" />
        </div>
      
        <div className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="explore" />
            </div>
            <div className={styles.homeSection}>
              <Explore device="desktop" />
            </div>
            <div className={styles.section3}>
              <div className={styles.homeContent}>
                <MyChats device="desktop" />
                <Following device="desktop" />
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
    </>
  );
};

export default Explore1;
