import { useState, useEffect } from "react";
import styles from "../styles/login.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import facebook from "../public/images/fb.svg";
import gmail from "../public/images/gmail.svg";
import google from "../public/images/google.svg";
import back from "../public/images/backwardarrow.svg";
import apple from "../public/images/apple.svg";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const [deviceType, setDeviceType] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth < 600
      ? "mobile"
      : "desktop";
  });

  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;

      if (width < 600) {
        setDeviceType("mobile");
      } else {
        setDeviceType("desktop");
      }
    };
    const handleResize = () => {
      detectDeviceType();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <>
      <div className={styles.container}>
        <div
          style={{
            backgroundColor: "#F5F5F5",
            width: 30,
            height: 30,
            marginTop: 64,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            borderRadius: "50%",
          }}
        >
          <Image src={back} />
        </div>
        <div className={styles.heading}>
          <h1 className={styles.boardingHead}>
            <Image src={logo} alt="logo" />
            &nbsp;Login
          </h1>
        </div>

        <div>
          {deviceType === "mobile" ? (
            <p className={styles.boardingPara}>
              Login to start uploading content, <br />
              discovering communities and more...
            </p>
          ) : (
            <p className={styles.boardingPara}>
              Login to start uploading content, discovering communities and
              more...
            </p>
          )}
        </div>

        <div className={styles.loginButtons}>
          <div className={styles.boardingButton}>
            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={facebook} alt="facebook" />
                <span className={styles.icon1}>Login with Facebook</span>
              </span>
            </div>

            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={google} alt="google" />
                <span className={styles.icon2} onClick={() => handleLogin()}>
                  Login with Google
                </span>
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
            <div className={styles.socialLinks}>
              <span className={styles.pdlLeftRight}>
                <Image src={gmail} alt="gmail" />
                <span className={styles.icon3}>Login with Gmail</span>
              </span>
            </div>
            <div className={styles.addAccount}>
              <p className={styles.addParaStyl}>
                Don&apos;t have account?{" "}
                <span className={styles.signStyl}>Sign Up</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
