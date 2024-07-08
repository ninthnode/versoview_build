import { useState, useEffect } from "react";
import styles from "../styles/reset-password.module.css";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import privacy from "../public/images/privacy.svg";
import group from "../public/images/group.svg";
import login from "../public/images/login.svg";
import check from "../public/images/check.svg";
import back from "../public/images/backwardarrow.svg";
import { deviceType } from "react-device-detect";
import desktopLogo from "../public/images/desktop-logo.svg";

const ResetPassword = () => {

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
            &nbsp;Reset Password
          </h1>
        </div>

        <div>            
            <p className={styles.boardingPara}>
              You will use this password to access your account
            </p>
        </div>

        <form className={styles.mobileForm}>
          <div>
            <div className={styles.formGroup}>

              <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <Image
                  src={privacy}
                  alt="Password Icon"
                  className={styles.icon}
                />
                <label className={styles.inputLabel}>Password</label>
              </div>

              <div className={styles.paswordBox}>

              <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <Image
                  src={group}
                  alt="Password Icon"
                  className={styles.passwordIcon}
                />
                <input
                  type="password"
                  placeholder="********"
                  className={styles.inputField}
                />
               </div>
              </div>
            </div>

            <div className={styles.formGroup}>
            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <Image
                src={privacy}
                alt="Password Icon"
                className={styles.icon}
              />
              <label className={styles.inputLabel}>Confirm Password</label>
            </div>
              
              <div className={styles.paswordBox}>
                <Image
                  src={group}
                  alt="Password Icon"
                  className={styles.passwordIcon}
                />
                <input
                  type="password"
                  placeholder="********"
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>

          <div className={styles.btnPosition}>
            <button type="submit" className={styles.submitButton}>
              Confirm and Reset
              <Image
                src={check}
                alt="Password Icon"
                className={styles.checkIcon}
              />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;
