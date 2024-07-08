
import { useState, useEffect } from "react";
import globalStyles from "../styles/global.module.css";

import passwordChecked from "../public/images/checkpassword.svg";
import styles from "../styles/password-changed.module.css";
import Image from "next/image";
import login from "../public/images/login.svg";
import desktopLogo from "../public/images/desktop-logo.svg";

const PasswordChanged = () => {

  return (
    <>
       <div className={`${globalStyles.onlyDesktop} ${globalStyles.topBarDesktop}`}>
        <Image
            src={desktopLogo}
            alt="desktopLogo"
            style={{width:231, height:36, marginLeft:110, marginTop:40}}
          />
      </div>
    
      <div className={styles.container}>
        <div className={styles.imageBox}>
          <Image
            src={passwordChecked}
            alt="passwordChecked"
            className={styles.passwordImg}
          />
        </div>

        <div className={styles.bottomContainer}>
          <div className={styles.contentBox}>
            <h3 className={styles.contentHeading}>Password Changed!</h3>
            <span className={styles.addAccountPara}>
              Your password has been changed
              <br /> successfully!
            </span>
          </div>

          <div className={styles.btnPosition}>
            <button type="submit" className={styles.submitButton}>
              Login
              <Image
                src={login}
                alt="Password Icon"
                className={styles.loginIcon}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordChanged;
