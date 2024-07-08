import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/choose-topics.module.css";
import logo from "../public/images/brownlogo.svg";
import Image from "next/image";
import desktopLogo from "../public/images/desktop-logo.svg";
import globalStyles from "../styles/global.module.css";
import chooseTopicsApi from "../api/chooseTopics";
import Loader from '../components/loader';
import Head from 'next/head';
import jwtDecode from 'jwt-decode';
import {updateUserApi} from "../api/authApi";

const Welcome = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [choices, setchoices] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchChooseTopicData = async () => {
      try {
        setLoading(true);
        const data = await chooseTopicsApi();
        setLoading(false);
        setchoices(data);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching choose topic data:", error);
      }
    };

    const storedToken = localStorage.getItem('token');
     
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode(storedToken);
      setUserId(decodedToken.id);
    }

    fetchChooseTopicData();
  }, []);
 
  const [selectedChoices, setSelectedChoices] = useState([]);

  const toggleChoice = (item) => {
    if (selectedChoices.includes(item)) {
      setSelectedChoices(selectedChoices.filter((choice) => choice !== item));
    } else {
      setSelectedChoices([...selectedChoices, item]);
    }
  }

  const isChoiceSelected = (item) => selectedChoices.includes(item);

  const handleEnterClick = async() => {
      const response = await updateUserApi({selectedChoices, userId});
      if(response){
        router.push(`/home`);
        setLoading(false);
      }
}

  return (
    <>
    <Head>
      <title>Versoview-Welcome</title>
    </Head>
      <div className={`${globalStyles.onlyDesktop} ${globalStyles.topBarDesktop}`}>
        <Image
            src={desktopLogo}
            alt="desktopLogo"
            className={globalStyles.logo}
          />
      </div>

      <div className={styles.container}>
        <div className={`${styles.heading} ${globalStyles.onlyMobileBlock}`} >
          <span className={styles.boardingHead}>
            <Image src={desktopLogo} alt="logo"  style={{marginTop:60, width:160}}/>
          </span>
        </div>

        <div className={styles.welcomeHeading}>
          <span>Welcome</span>
        </div>

        <div className={styles.choiceContainer}>
          {loading ? <Loader /> : (<>{choices.map((item, index) => {
            return (
              <div
                key={index}
                className={`${styles.OuterBox} ${
                  isChoiceSelected(item.genreName) ? styles.active : ""
                }`}
                onClick={() => toggleChoice(item.genreName)}
              >
                <p className={styles.itemStyle}>{item.genreName}</p>
              </div>
            );
          })}</>)}
        </div>

        <div className={styles.btnContainer}>
          <button
            className={`${styles.btn} ${
              selectedChoices.length >= 1 ? styles.active : ""
            }`}
            onClick={handleEnterClick}
          >
            {loading ? <Loader /> : <span>Enter</span>}
          </button>
        </div>

        <div className={styles.noteContainer}>
          <p className={styles.notePara}>
            Choose three or more topics which interest you
          </p>
        </div>
      </div>
    </>
  );
};

export default Welcome;
