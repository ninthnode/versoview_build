import Link from "next/link";
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import styles from "../styles/bottom-nav.module.css";
import Image from "next/image";
import homeactive from "../public/images/homeactive.svg";
import home from "../public/images/home.svg";
import search from "../public/images/search1.svg";
import searchactive from "../public/images/searchactive.svg";
import bookmark from "../public/images/bookmark.svg";
import bookmarkactive from "../public/images/bookmarkactive.svg";
import publish from "../public/images/+.svg";
import profile from "../public/images/avtar.svg";
import profileactive from "../public/images/avtar-active.svg";
import { FaCirclePlus } from "react-icons/fa6";
import plusCircle from "../public/images/plus_circle.svg";

const BottomNav = ({ activePage }) => {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  const handleLinkClick = (page) => {
    if (!authenticated && page !== "home" && page !== "explore") {
      router.push('/login');
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bottomNavbar}>
        <div onClick={() => handleLinkClick("home")} className={styles.icon}>
          {activePage === "home" ? (
            <Image src={homeactive} alt="homeimage" />
          ) : (
            <Image src={home} alt="homeimage" />
          )}
          <span
            className={activePage === "home" ? styles.active : styles.nonactive}
          >
            Home
          </span>
        </div>
        <div onClick={() => handleLinkClick("explore")} className={styles.icon}>
          {activePage === "explore" ? (
            <Image src={searchactive} alt="searchimage" />
          ) : (
            <Image src={search} alt="searchimage" />
          )}
          <span
            className={
              activePage === "explore" ? styles.active : styles.nonactive
            }
          >
            Explore
          </span>
        </div>
        <div onClick={() => handleLinkClick("bookmarks")} className={styles.icon}>
          {activePage === "bookmarks" ? (
            <Image src={bookmarkactive} alt="bookmarkimage" />
          ) : (
            <Image src={bookmark} alt="bookmarkimage" />
          )}
          <span
            className={
              activePage === "bookmarks" ? styles.active : styles.nonactive
            }
          >
            Bookmarks
          </span>
        </div>
        <div onClick={() => handleLinkClick("publish")} className={styles.icon}>
          <div className={styles.plusIcon}>
          <Image src={plusCircle} alt="pluscircle" style={{width:20, height:20}}/>
          </div>
          <span
            className={
              activePage === "publish" ? styles.active : styles.nonactive
            }
          >
            Publish
          </span>
        </div>
        <div onClick={() => handleLinkClick("profile")} className={styles.icon}>
          {activePage === "profile" ? (
            <Image src={profileactive} alt="profileimage" />
          ) : (
            <Image src={profile} alt="profileimage" />
          )}
          <span
            className={
              activePage === "profile" ? styles.active : styles.nonactive
            }
          >
            Profile
          </span>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
