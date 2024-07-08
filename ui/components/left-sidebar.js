import React, { useRef, useState } from "react";
import styles from "../styles/left-sidebar.module.css";
import Image from "next/image";
import home from "../public/images/home.svg";
import setting from "../public/images/Cog.svg";
import database from "../public/images/database.svg";
import pdfview from "../public/images/pdficon.svg";

const LeftSidebar = ({ onPdfSelected }) => {
  const fileInputRef = useRef(null);
  const [activeIcon, setActiveIcon] = useState(null);

  const handlePdfSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onPdfSelected(selectedFile);
    }
  };

  const handleIconClick = (icon) => {
    setActiveIcon(icon);
  };

  return (
    <div className={styles.leftSideBar}>
      <div
        className={`${styles.icon} ${
          activeIcon === "home" && styles.activeIcon
        }`}
      >
        <Image src={home} alt="home" onClick={() => handleIconClick("home")} />
      </div>
      <hr />
      <div
        className={`${styles.icon} ${
          activeIcon === "pdfview" && styles.activeIcon
        }`}
        onClick={handlePdfSelect}
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Image
          src={pdfview}
          alt="pdfview"
          className={styles.pdficon}
          onClick={() => handleIconClick("pdfview")}
        />
      </div>
      <hr />
      <div
        className={`${styles.icon} ${
          activeIcon === "other" && styles.activeIcon
        }`}
      >
        <Image className={styles.pdficon} src={database} alt="home" onClick={() => handleIconClick("other")} />
      </div>
      <hr />
      <div
        className={`${styles.icon} ${
          activeIcon === "settings" && styles.activeIcon
        }`}
      >
        <Image
          src={setting}
          alt="settings"
          onClick={() => handleIconClick("settings")}
        />
      </div>
      <hr />
    </div>
  );
};

export default LeftSidebar;
