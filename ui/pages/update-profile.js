import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import BottomNav from "../components/bottom-nav";
import DesktopLeftNav from "../components/left-navbar";
import UpdateProfile from "../components/update-profile";
import MyChats from "../components/mychats";
import Following from "../components/following";
import { ToastContainer } from "react-toastify";
import useDeviceType from '../hooks/responsive_hook';

const UpdateProfilePage = () => {
  const deviceType = useDeviceType();

  return (
    <>
      {deviceType === "mobile" ? (
        <div>
          <UpdateProfile device="mobile" />
          <BottomNav activePage="home" />
        </div>
      ) : (
        <div className={styles.desktopContainer}>
          <div className={styles.parentContainer}>
            <div className={styles.leftNavbar}>
              <DesktopLeftNav activePage="home" />
            </div>
            <div className={styles.homeSection}>
              <UpdateProfile device="desktop" />
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
      <ToastContainer />
    </>
  );
};

export default UpdateProfilePage;
