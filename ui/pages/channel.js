import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import Channel from "../components/channel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from 'next/head';

const ChannelPage = () => {

  return (
    <>
       <Head>
        <title>Versoview-Channel</title>
       </Head>
        <div className={globalStyles.onlyMobileBlock}>
          <Channel device="mobile" />
          <BottomNav activePage="profile" />
        </div>
      
        <div className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="profile" />
            </div>
            <div className={styles.homeSection}>
              <Channel device="desktop" />
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

export default ChannelPage;
