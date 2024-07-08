import { useState } from "react";
import styles from "../styles/home.module.css";
import profileStyle from "../styles/profile.module.css";
import createProfileStyle from "../styles/create-profile.module.css";
import channelStyles from "../styles/channel.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import channel from "../public/images/home2.svg";
import menuicon from "../public/images/menu.svg";
import uparrow from "../public/images/uparrow.svg";
import downarrow from "../public/images/downarrow.svg";
import img1 from "../public/images/img1.png";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BiLogoFacebookSquare } from "react-icons/bi";
import { FaTelegram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import BottomNav from "../components/bottom-nav";
import Head from 'next/head';

const createProfile = () => {
  return (
    <>
    <Head>
      <title>Versoview-Profile</title>
    </Head>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h1 className={`${styles.boardingHead} ${profileStyle.boardingHead}`}>
            <Image src={logo} alt="logo" />
            &nbsp;Profile
          </h1>
        </div>
        <hr />
        <div className={profileStyle.outerBox}>
          <div className={profileStyle.profileData}>
            <div>
              <Image
                src={channel}
                alt="channelimage"
                width="59px"
                height="59px"
              />
            </div>
            <div>
              <p className={profileStyle.editBtn}>Save</p>
            </div>
          </div>

          {/* about details */}
          <div className={profileStyle.mainContainer}>
            <div
              className={`${profileStyle.aboutDtailsBox} ${createProfileStyle.aboutDtailsBox}`}
            >
              <form>
                <div className={profileStyle.heading}>
                  <p className={profileStyle.headStyle}>About</p>
                  <p className={profileStyle.editBtn}>Save</p>
                </div>
                <p className={createProfileStyle.inputTextBox}>
                  <textarea className={createProfileStyle.textarea}>
                    Connecting homes and hearts for 95 years, Home Beautiful is
                    the most established and respected premium home improvement
                    brand in Australia.
                  </textarea>
                </p>
                <div className={profileStyle.contentBox}>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>7</p>
                    <p className={channelStyles.contentStyle}>Posts</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>3</p>
                    <p className={channelStyles.contentStyle}>Editions</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>27</p>
                    <p className={channelStyles.contentStyle}>Articles</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>6</p>
                    <p className={channelStyles.contentStyle}>Following</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>1275</p>
                    <p className={channelStyles.contentStyle}>Followers</p>
                  </div>
                </div>
                <hr />

                <div className={profileStyle.shareChannelBox}>
                  <p className={profileStyle.channelName}>Share channel</p>
                  <p className={profileStyle.socialIcons}>
                    <AiFillInstagram />
                    <FaTelegram />
                    <AiFillTwitterCircle />
                    <FaFacebook />
                  </p>
                </div>
                <hr />

                <div className={profileStyle.channelGenre}>
                  <div className={profileStyle.head}>
                    <li className={profileStyle.list}>Genre</li>
                    <li className={profileStyle.list}>Subgenre</li>
                  </div>
                  <div className={profileStyle.head}>
                    <li className={profileStyle.list}>
                      <select className={createProfileStyle.selecteInputField}>
                        <option value="option1">Home & Decor</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </select>
                    </li>
                    <li className={profileStyle.mainProfile_1}>
                      <input
                        type="text"
                        className={createProfileStyle.HeadInputField_1}
                        value={"-"}
                      />
                    </li>
                  </div>
                </div>

                <hr />

                <div className={profileStyle.channelGenre}>
                  <div className={profileStyle.head}>
                    <li className={profileStyle.mainProfile}>Profile</li>
                    <li
                      className={`${profileStyle.list} ${createProfileStyle.pt}`}
                    >
                      Name
                    </li>
                    <li
                      className={`${profileStyle.list} ${createProfileStyle.pt}`}
                    >
                      URL
                    </li>
                    <li
                      className={`${profileStyle.list} ${createProfileStyle.pt}`}
                    >
                      Email
                    </li>
                    <li
                      className={`${profileStyle.list} ${createProfileStyle.pt}`}
                    >
                      Phone
                    </li>
                    <li
                      className={`${profileStyle.list} ${createProfileStyle.pt}`}
                    >
                      Location
                    </li>
                  </div>
                  <div className={profileStyle.head}>
                    <li className={profileStyle.mainProfile_1}>
                      <input
                        type="text"
                        className={createProfileStyle.HeadInputField}
                        value={"@Home_Beautiful"}
                      />
                    </li>
                    <li className={profileStyle.mainSubProfile}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={" @HomeBeautifulAus"}
                      />
                    </li>
                    <li className={profileStyle.list}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={"Home Beautiful"}
                      />
                    </li>
                    <li className={profileStyle.list}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={"homebeautiful.com.au"}
                      />
                    </li>
                    <li className={profileStyle.list}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={"feedback@homebeautiful.com.au"}
                      />
                    </li>
                    <li className={profileStyle.list}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={"-"}
                      />{" "}
                    </li>
                    <li className={profileStyle.list}>
                      <input
                        type="text"
                        className={createProfileStyle.inputField}
                        value={"Sydney, Australia"}
                      />
                    </li>
                  </div>
                </div>
              </form>
              <hr />

              <div className={profileStyle.shareChannelBox}>
                <p className={profileStyle.channelName}>Library</p>
              </div>

              <hr />

              <div className={profileStyle.heading}>
                <p className={profileStyle.publication}>PUBLICATIONS – 3</p>
                <Image src={uparrow} alt="uparrow" />
              </div>
              <hr />
              <div className={profileStyle.heading}>
                <p className={profileStyle.publication}>
                  Summer 2023, June 1 2023
                </p>
                <Image src={downarrow} alt="downarrow" />
              </div>
              <hr />
              <div className={profileStyle.heading}>
                <p className={profileStyle.publication}>
                  Spring 2023, March 1 2023
                </p>
                <Image src={downarrow} alt="downarrow" />
              </div>
              <hr />
              <div className={profileStyle.heading}>
                <p className={profileStyle.publication}>
                  Winter 2022, December 1 2022
                </p>
                <Image src={uparrow} alt="uparrow" />
              </div>
              <hr />
              <div className={profileStyle.heading}>
                <p className={profileStyle.publication}>POSTS – 7</p>
                <Image src={uparrow} alt="uparrow" />
              </div>
              <hr />

              <div className={profileStyle.heading}>
                <p className={profileStyle.parafont}>VersoRewards</p>
                <p className={profileStyle.parafont}>Points</p>
                <Image src={downarrow} alt="downarrow" />
              </div>
              <hr />

              <div className={profileStyle.viewcontentBox}>
                <div
                  className={`${profileStyle.viewcontentBox} ${profileStyle.col1}`}
                >
                  <Image
                    src={img1}
                    alt="image"
                    className={profileStyle.setImage}
                  />
                  &nbsp;
                  <p className={profileStyle.viewcontent}>Joel Bookzs</p>
                </div>
                <p
                  className={`${profileStyle.viewcontent} ${profileStyle.col2}`}
                >
                  124
                </p>
                <Image src={menuicon} alt="menuicon" />
              </div>
              <hr />

              {/* add more */}
              <div className={profileStyle.viewcontentBox}>
                <div
                  className={`${profileStyle.viewcontentBox} ${profileStyle.col1}`}
                >
                  <Image
                    src={img1}
                    alt="image"
                    className={profileStyle.setImage}
                  />
                  &nbsp;
                  <p className={profileStyle.viewcontent}>Colours Magazine</p>
                </div>
                <p
                  className={`${profileStyle.viewcontent} ${profileStyle.col2}`}
                >
                  187
                </p>
                <Image src={menuicon} alt="menuicon" />
              </div>
              <hr />
            </div>
          </div>
        </div>
        <BottomNav activePage="profile" />
      </div>
    </>
  );
};

export default createProfile;
