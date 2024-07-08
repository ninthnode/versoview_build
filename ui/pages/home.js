import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/home.module.css";
import globalStyles from "../styles/global.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from 'next/head';
import useDeviceType from '../hooks/responsive_hook';

const Home = () => {
  const router = useRouter();
  const deviceType = useDeviceType();

  return (
    <>
    <Head>
      <title>Versoview-Home</title>
    </Head>
      <div className={globalStyles.onlyMobileBlock}>
      <Latest device="mobile"/>
      <BottomNav activePage="home" />
      </div>

      <div
        className={`${styles.desktopContainer} ${globalStyles.onlyDesktopBlock}`}
      >
        <div className={styles.parentContainer}>
          <div className={styles.leftNavbar}>
            <DesktopLeftNav activePage="home" />
          </div>
          <div className={styles.homeSection}>
          <Latest device="desktop"/>
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

export default Home;
