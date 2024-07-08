import { useState, useEffect } from "react";
import globalStyles from "../styles/global.module.css";
import { useRouter } from 'next/router';
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import community from "../public/images/community-icon.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import doublechat from "../public/images/doublechat.svg";
import book from "../public/images/book.svg";
import profilesData from "../profileData.json";
import divider from "../public/images/divider.svg";
import {getAllPost} from "../api/postApi";
import image1 from "../public/images/AnantaraSriLanka.png";
import image2 from "../public/images/aavegotchi.png";
import bookmarkApi from "../api/addBookmarks";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import removeBookmarkApi from "../api/removebookmark";
import {getAllChannelApi} from "../api/channelApi";
import filterPostApi from "../api/filterPostByTopics";
import profileImage from "../public/images/defaultProfile.svg";
import FormatDate from "./formateDate";
import getAllBookmarkApi from "../api/getAllBookmark";
import Loader from '../components/loader';
import { ShimmerCategoryItem,ShimmerThumbnail,ShimmerTitle, ShimmerText, ShimmerTable, ShimmerBadge, ShimmerCircularImage } from "react-shimmer-effects";
import styles from "../styles/home.module.css";

const ShimmerEffect = () => {
    const [channels, setchannels] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    return (
        <>
        <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.shimmerHeadContainer}>
          <ShimmerCircularImage size={30} />&nbsp;&nbsp;
          <ShimmerBadge width={120} style={{marginLeft : 10}}/>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 1.5,
            backgroundColor: "#707070",
            opacity: 0.1,
          }}
        ></div>

        <div className={styles.homeNav} style={{ marginTop: 0 }}>
          <ul className={styles.shimmerNavbar}>
            <li className={styles.listStyle}>
              <ShimmerBadge width={100} />
            </li>
            <li className={styles.listStyle}>
              <ShimmerBadge width={100} />
            </li>
            <li className={styles.listStyle}>
               <ShimmerBadge width={100} />
            </li>
          </ul>
        </div>

        <div
          style={{
            width: "100%",
            height: 2,
            backgroundColor: "#707070",
            opacity: 0.1,
            marginTop: -3,
          }}
        ></div>

        <div className={styles.userProfileContainer}>
          <div className={styles.userProfileRow}>
            {[...Array(15)].map((item, index) => (
              <div
                key={index}
                className={`${styles.profile}`}
              >
                <ShimmerThumbnail width={25} height={45} rounded />
              </div>
            ))}
          </div>

            <div
              style={{
                width: "100%",
                height: 2,
                backgroundColor: "#707070",
                opacity: 0.1,
                marginTop: 7,
                marginBottom : 20
              }}
            ></div>
          
          <div style={{paddingBottom : "60px"}}>
            {[...Array(15)].map((item, index) => {
              return (
                <div key={index} className={styles.profileDetails}>
                    <ShimmerCategoryItem
                        hasImage
                        imageType="thumbnail"
                        imageWidth={100}
                        imageHeight={100}
                        title
                        className={styles.shimmerHeader}
                        />
                    <ShimmerThumbnail height={250} rounded />
                    <ShimmerTitle line={1} gap={10} variant="primary" />
                    <ShimmerTitle line={1} gap={10} variant="primary" />
                    <ShimmerText line={8} gap={10} className={styles.ShimmerText}/>
                 
                  <div
                    style={{
                      width: "100%",
                      height: 2,
                      backgroundColor: "#707070",
                      opacity: 0.1,
                      marginTop: 12,
                      marginBottom: 20,
                    }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
    )
}

export default ShimmerEffect;