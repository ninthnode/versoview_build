import React from "react";
import logo from "../public/images/brownlogo.svg";
import home1 from "../public/images/home1.svg";
import styles from "../styles/top-navbar.module.css";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <nav className={styles.topNav}>
        <div className={styles.heading}>
          <Image src={logo} alt="Logo" />
          <h2 className={styles.mainHeading}>VersoView</h2>
        </div>
        <div className={styles.heading}>
          <Image src={home1} alt="Home" className={styles.img} />
          <h2 className={styles.subHeading}>Home Beautiful</h2>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
