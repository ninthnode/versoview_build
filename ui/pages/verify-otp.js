import { useState, useEffect } from "react";
import styles from "../styles/verify-otp.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import check from "../public/images/check.svg";
import back from "../public/images/backwardarrow.svg";
import useDeviceType from '../hooks/responsive_hook';

const VerifyOTP = () => {
  const deviceType = useDeviceType();
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
            &nbsp;Verify OTP
          </h1>
        </div>

        <div>
          {deviceType === "mobile" ? (
            <p className={styles.boardingPara}>
              Enter the 4-digits code sent to your <br /> registered email
            </p>
          ) : (
            <p className={styles.boardingPara}>
              Enter the 4-digits code sent to your registered email
            </p>
          )}
        </div>

        <form className={styles.mobileForm}>
          <div className={styles.bottomContainer}>
            <div className={styles.otpContainer}>
              {placeholders.map((placeholder, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className={styles.otpInput}
                  placeholder={placeholder}
                />
              ))}
            </div>

            <div>
              <div className={styles.addAccount}>
                <p className={styles.addParaStyl}>
                  Don&apos;t recieve the code yet?{" "}
                  <span className={styles.signStyl}>Resend</span>
                </p>
              </div>

              <div className={styles.btnPosition}>
                <button type="submit" className={styles.submitButton}>
                  Verify OTP
                  <Image
                    src={check}
                    alt="Password Icon"
                    className={styles.checkIcon}
                  />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default VerifyOTP;
