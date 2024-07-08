import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Latest from "../components/latest";
import MyChats from "../components/mychats";
import Following from "../components/following";
import Mydms from "../components/mydms";
import useDeviceType from '../hooks/responsive_hook';

const Mydms1 = () => {
  const deviceType = useDeviceType();

  return (
    <>
      {deviceType === "mobile" ? (
        <div>
          <Mydms device="mobile" />
          <BottomNav activePage="home" />
        </div>
      ) : (
        <div className={styles.desktopContainer}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="home" />
            </div>
            <div className={styles.homeSection}>
              <Latest device="desktop" />
            </div>
            <div className={styles.section3}>
              <div className={styles.homeContent}>
                <Mydms device="desktop" />
                <Following device="desktop" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Mydms1;
