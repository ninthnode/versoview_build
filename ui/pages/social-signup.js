import { useState, useEffect } from "react";
import styles from "../styles/login.module.css";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import facebook from "../public/images/fb.svg";
import gmail from "../public/images/gmail.svg";
import google from "../public/images/google.svg";
import apple from "../public/images/apple.svg";
import back from "../public/images/back.svg";
import desktopLogo from "../public/images/desktop-logo.svg";

const SocialSignUp = () => {
  
  return (
    <>
      <div className={`${globalStyles.onlyDesktop} ${globalStyles.topBarDesktop}`}>
        <Image
            src={desktopLogo}
            alt="desktopLogo"
            className={globalStyles.logo}
          />
      </div>
    
      <div className={styles.container}>
        <div
          style={{
            backgroundColor: "#F5F5F5",
            width: 30,
            height: 30,
            marginTop: 30,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            borderRadius: "50%",
          }}
        >
          <Image src={back} />
        </div>

        <div className={styles.heading}>
          <h1 className={styles.boardingHead}>
            <Image src={logo} alt="logo" />
            &nbsp;Create Account
          </h1>
        </div>

        <div>          
            <p className={styles.boardingPara}>
              Login to start uploading content, discovering communities and
              more...
            </p>
        </div>

        <div className={styles.loginButtons}>
          <div className={styles.boardingButton}>
            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={facebook} alt="facebook" />
                <span className={styles.icon1}>Sign up with Facebook</span>
              </span>
            </div>

            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={google} alt="google" />
                <span className={styles.icon2}>Sign up with Google</span>
              </span>
            </div>

            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={apple} alt="apple" />
                <span className={styles.icon3}>Sign up with Apple</span>
              </span>
            </div>
          </div>

          <div className={styles.gmailLogin}>
            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={gmail} alt="gmail" />
                <span className={styles.icon3}>Sign up with Gmail</span>
              </span>
            </div>
            <div className={styles.addAccount}>
              <p className={styles.addParaStyl}>
                Already have an account?{" "}
                <span className={styles.signStyl}>Login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialSignUp;
