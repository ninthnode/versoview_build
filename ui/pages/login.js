import { useState, useEffect } from "react";
import styles from "../styles/login.module.css";
import globalStyles from "../styles/global.module.css";
import Link from "next/link";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import facebook from "../public/images/fb.svg";
import gmail from "../public/images/gmail.svg";
import google from "../public/images/google.svg";
import back from "../public/images/backwardarrow.svg";
import apple from "../public/images/apple.svg";
import desktopLogo from "../public/images/desktop-logo.svg";
import { useSession, signIn, signOut } from "next-auth/react"

const Login = () => {
  const session = useSession();

  const [isClicked, setIsClicked] = useState(false);


  const handleBackClick = () => {
    window.location.href = "/manual-signup";
  };

  const handleClick = (e) => {
    e.preventDefault();
    setIsClicked(true);
  };

  return (
    <>
      <div
        className={`${globalStyles.onlyDesktop} ${globalStyles.topBarDesktop}`}
      >
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
            marginTop: 20,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: "pointer",
            borderRadius: "50%",
          }}
          onClick={handleBackClick}
        >
          <Image src={back} />
        </div>
        <div className={styles.heading}>
          <h1 className={styles.boardingHead}>
            <Image src={logo} alt="logo" />
            <span style={{ marginLeft: 6 }}>Login</span>
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
                <span className={styles.icon1} onClick={() => signIn('facebook')}>Login with Facebook</span>
              </span>
            </div>

            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={google} alt="google" />
                <span className={styles.icon2} onClick={() => signIn('google')}>Login with Google</span>
              </span>
            </div>

            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={apple} alt="apple" />
                <span className={styles.icon3}>Login with Apple</span>
              </span>
            </div>
          </div>

          <div className={styles.gmailLogin}>
            <div className={`${styles.socialLinks} ${isClicked ? styles.highlightedLink : ''}`} onClick={handleClick}>
              <Link href="/login-with-email"  className={styles.linksDecoration}  >
                <span className={styles.pdlLeftRight}>
                  <Image src={gmail} alt="gmail" />
                  <span className={`${styles.icon3} ${isClicked ? styles.highlightIcon3 : ''}`}>Login with Email</span>
                </span>
              </Link>
            </div>
            <div className={styles.addAccount}>
              <p className={styles.addParaStyl}>
                Don&apos;t have account?{" "}
                <Link href="/manual-signup" className={styles.linkStyle}>
                  <span className={styles.signStyl}>SignUp</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
