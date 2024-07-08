import React, { useState } from "react";
import styles from "../styles/forgot-password.module.css";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import envelope from "../public/images/envelope.svg";
import padlock from "../public/images/padlock.svg";
import backButton from "../public/images/backwardarrow.svg";
import desktopLogo from "../public/images/desktop-logo.svg";
import Head from 'next/head';

// import forgotPasswordApi from "../api/forgotPassword";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // const handleSubmit = async (e) => {
    // e.preventDefault();
    // try {
    //   await forgotPasswordApi(email);
    //   setMessage("Reset link sent successfully");
    // } catch (error) {
    //   setMessage("Failed to send reset link");
    //   console.error(error);
    // }
  // };

  return (
    <>
      <Head>
        <title>Versoview-ForgotPassword</title>
      </Head>
      <div className={`${globalStyles.onlyDesktop} ${globalStyles.topBarDesktop}`}>
        <Image
            src={desktopLogo}
            alt="desktopLogo"
            className={globalStyles.logo}
          />
      </div>

      <div className={styles.container}>
        <Image
          src={backButton}
          alt="backbutton"
          className={styles.backButton}
        />
        <div className={styles.heading}>
          <h1 className={styles.boardingHead}>
            <Image src={logo} alt="logo" />
            &nbsp;Forgot Password
          </h1>
        </div>

        <div>
          <p className={styles.boardingPara}>
            Enter your registered email to receive <br /> reset link for your
            password
          </p>
        </div>

        <form className={styles.mobileForm}>
          <div className={styles.formGroup}>
            <Image src={envelope} alt="Email Icon" className={styles.icon} />
            <label className={styles.inputLable}>Email</label>
            <br />
            <input
              type="email"
              placeholder="must4277@gmail.com"
              name="email"
              className={styles.inputField}
              // onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.btnPosition}>
            <button type="submit" className={styles.submitButton}>
              Reset Password
              <Image
                src={padlock}
                alt="Password Icon"
                className={styles.resetIcon}
              />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;
