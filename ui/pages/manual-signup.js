"use client"
import { useState, useEffect } from "react";
import styles from "../styles/manual-signup.module.css";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import privacy from "../public/images/privacy.svg";
import envelope from "../public/images/envelope.svg";
import group from "../public/images/group.svg";
import login from "../public/images/login.svg";
import user from "../public/images/user.svg";
import addUser from "../public/images/addUser.svg";
import back from "../public/images/backwardarrow.svg";
import {signUpApi} from "../api/authApi";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import desktopLogo from "../public/images/desktop-logo.svg";
import Loader from '../components/loader';
import useDeviceType from '../hooks/responsive_hook';

const ManualSignUp = () => {
  const [loading, setLoading] = useState(false);
  const deviceType = useDeviceType();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    channelIconImageUrl: "",
    backgroundColor : "",
    channelName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (errorMessage) {
      return;
    }
    try {
      setLoading(true);
      const data = await signUpApi(formData);
      if (data && data.status === 200 && data.data.token) {
        setLoading(false);
        const token = data.data.token;
        localStorage.setItem("token", token);
        // toast.success(data.message);
        setTimeout(() => {
          window.location.replace("/choose-topics");
        }, 1000);
      } else {
        setLoading(false);
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,32}$/;

    if (name === "password") {
      if (!passwordRegex.test(value)) {
        setErrorMessage(
          "Password should be 6 to 32 characters long and include at least one special character and one capital letter and one small letter and aleast one numeric value."
        );
      } else {
        setErrorMessage("");
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

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
            <p
              style={{ marginBottom: "40px", marginTop: 0 }}
              className={styles.boardingPara}
            >
              Login to start uploading content, discovering communities and
              more…
            </p>          
        </div>

        <form className={styles.mobileForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <Image src={user} alt="Email Icon" className={styles.icon} />
                <label className={styles.inputLabel}>Channel Name</label>
            </div>
            
            <input
              type="text"
              name="channelName"
              value={formData.channelName}
              placeholder="Khalid Saied"
              className={styles.inputField}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <Image src={user} alt="Email Icon" className={styles.icon} />
              <label className={styles.inputLabel}>@User name; ie: @KhaidS</label>
            </div>
            
            <input
              type="text"
              placeholder="@KhalidS"
              name="username"
              value={formData.username}
              className={styles.inputField}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>

            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <Image src={envelope} alt="Email Icon" className={styles.icon} />
              <label className={styles.inputLabel}>Email</label>
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="must4277@gmail.com"
              className={styles.inputField}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>

            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <Image src={privacy} alt="Password Icon" className={styles.icon} />
                <label className={styles.inputLabel}>Password</label>
            </div>
            <div className={styles.paswordBox}>
              <Image
                src={group}
                alt="Password Icon"
                className={styles.passwordIcon}
                onClick={togglePasswordVisibility}
              />
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="********"
                name="password"
                value={formData.password}
                className={styles.inputField}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {errorMessage ? (
            <div
              style={{
                color: "red",
                fontFamily: `sans-serif`,
                fontSize: "11px",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </div>
          ) : (
            ""
          )}

          <div className={styles.content}>
            {deviceType === "mobile" ? (
              <p className={styles.addAccountPara}>
                By signing up you agree with our{" "}
                <span className={styles.spanColor}>
                  Terms <br /> and Conditions
                </span>
              </p>
            ) : (
              <p className={styles.addAccountPara}>
                By signing up you agree with our{" "}
                <span className={styles.spanColor}>Terms and Conditions</span>
              </p>
            )}
          </div>
          <div className={styles.addAccount}>
            <p className={styles.addParaStyl}>
              Already have an account?{" "}
              <Link href="/login" className={styles.linkStyle}>
                <span className={styles.signStyl}>Login</span>
              </Link>
            </p>
          </div>

          <div className={styles.btnPosition}>
            <button type="submit" className={styles.submitButton}>
            {loading ? <Loader type="sync" />  : <span>Sign Up</span>}
              <Image
                src={addUser}
                alt="Password Icon"
                className={styles.loginIcon}
              />
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default ManualSignUp;
