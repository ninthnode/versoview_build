import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import Profile from "../components/profile";
import MyChats from "../components/mychats";
import Following from "../components/following";
import useDeviceType from '../hooks/responsive_hook';

const ProfilePage = () => {
  const deviceType = useDeviceType();

  return (
    <>
      {deviceType === "mobile" ? (
        <div>
          <Profile device="mobile" />
          <BottomNav activePage="profile" />
        </div>
      ) : (
        <div className={styles.desktopContainer}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="profile" />
            </div>
            <div className={styles.homeSection}>
              <Profile device="desktop" />
            </div>
            <div className={styles.section3}>
              <div className={styles.homeContent}>
                <MyChats device="desktop" />
                <Following device="desktop" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
