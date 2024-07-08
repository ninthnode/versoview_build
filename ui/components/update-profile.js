import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import createProfileStyle from "../styles/create-profile.module.css";
import profileStyle from "../styles/profile.module.css";
import channelStyles from "../styles/channel.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import channel from "../public/images/joen1.svg";
import menuicon from "../public/images/menu.svg";
import uparrow from "../public/images/uparrow.svg";
import downarrow from "../public/images/downarrow.svg";
import book from "../public/images/book.svg";
import doublechat from "../public/images/doublechat.svg";
import img1 from "../public/images/img1.png";
import profilesData from "../profileData.json";
import { SketchPicker } from "react-color";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BiLogoFacebookSquare } from "react-icons/bi";
import { FaTelegram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { deviceType } from "react-device-detect";
import { FaInstagram } from "react-icons/fa";
import {updateProfileApi} from "../api/authApi";
import {ToastContainer,  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import getProfileApi from "../api/authApi";
import Loader from '../components/loader'

const UpdateProfile = ({ device}) => {
  const router = useRouter();
  const { channelId } = router.query;
  const [loading, setLoading] = useState(false);
  const [showDialog1, setShowDialog1] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  const [showDialog3, setShowDialog3] = useState(false);
  const [showDialog4, setShowDialog4] = useState(false);
  const [showDialog5, setShowDialog5] = useState(false);
  const [isColorSaved, setIsColorSaved] = useState(false);
  const [arrowUp1, setArrowUp1] = useState(true);
  const [arrowUp2, setArrowUp2] = useState(true);
  const [arrowUp3, setArrowUp3] = useState(true);
  const [arrowUp4, setArrowUp4] = useState(true);
  const [arrowUp5, setArrowUp5] = useState(true);
  const [view, setview] = useState(false);
  const [arrowUp, setArrowUp] = useState(true);
  const [shadow1, setshadow1] = useState(false);
  const [shadow2, setshadow2] = useState(false);
  const [shadow3, setshadow3] = useState(false);
  const [shadow4, setshadow4] = useState(false);
  const [shadow5, setshadow5] = useState(false);
  const [formData, setFormData] = useState({
    channelIconImageUrl:"",
    channelName: "",
    about: "",
    genre: "",
    subGenre: "",
    profileTitle: "",
    profileHandle: "",
    url: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const response = await getProfileApi({channelId});
        const channelData = response.data;
        setFormData(channelData);
      } catch (error) {
        console.error('Error fetching channel details:', error.message);
      }
    };

    fetchChannelDetails();
  }, [channelId]);

  const localStorageColor =
    typeof window !== "undefined" &&
    localStorage.getItem("profileBackgroundColor");

  // Ensure localStorageColor is used as the initial state
  const [color, setColor] = useState(localStorageColor || "#561ecb");
  const [isEditingColor, setIsEditingColor] = useState(false);

  // Save the color to local storage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("profileBackgroundColor", color);
    }
  }, [color]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const data = await updateProfileApi({channelId, formData});
    setLoading(false);
    if(data && data.status === 200){
      // toast.success(data.message);
      window.location.replace("/profile")
    }
    else if(data && data.sataus === 404)
    {
      setLoading(false);
      toast.error(data.message);
    }
    else{
      setLoading(false);
      toast.error("Failed to update profile");
    }
  };

  const handleEditColor = () => {
    setIsEditingColor(!isEditingColor);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };

  const handleSaveColor = () => {
    setIsEditingColor(false);
    setIsColorSaved(true);
  };

  const handleArrowClick1 = () => {
    setArrowUp1(!arrowUp1);
    setShowDialog1(!showDialog1);
    setshadow1(true);
  };

  const handleDownArrowClick1 = () => {
    setArrowUp1(!arrowUp1);
    setShowDialog1(!showDialog1);
    setshadow1(false);
  };

  const handleArrowClick2 = () => {
    setArrowUp2(!arrowUp2);
    setShowDialog2(!showDialog2);
    setshadow2(true);
  };

  const handleDownArrowClick2 = () => {
    setArrowUp2(!arrowUp2);
    setShowDialog2(!showDialog2);
    setshadow2(false);
  };

  const handleArrowClick3 = () => {
    setArrowUp3(!arrowUp3);
    setShowDialog3(!showDialog3);
    setshadow3(true);
  };

  const handleDownArrowClick3 = () => {
    setArrowUp3(!arrowUp3);
    setShowDialog3(!showDialog3);
    setshadow3(false);
  };

  const handleArrowClick4 = () => {
    setArrowUp4(!arrowUp4);
    setShowDialog4(!showDialog4);
    setshadow4(true);
  };

  const handleDownArrowClick4 = () => {
    setArrowUp4(!arrowUp4);
    setShowDialog4(!showDialog4);
    setshadow4(false);
  };

  const handleArrowClick5 = () => {
    setArrowUp5(!arrowUp5);
    setShowDialog5(!showDialog5);
    setshadow5(true);
  };

  const handleDownArrowClick5 = () => {
    setArrowUp5(!arrowUp5);
    setShowDialog5(!showDialog5);
    setshadow5(false);
  };

  const handleArrowClick6 = () => {
    setArrowUp(!arrowUp);
    setview(!view);
  };

  return (
    <>
      <div className={profileStyle.container}>
        <div className={styles.heading}>
          <h1
            style={device === "desktop" ? { marginTop: "18px" } : null}
            className={`${styles.boardingHead} ${profileStyle.boardingHead}`}
          >
            <Image src={logo} alt="logo" />
            &nbsp;Profile
          </h1>
        </div>

        <div
          className={profileStyle.outerBox}
          style={{
            backgroundColor: isColorSaved ? localStorageColor : color,
          }}
        >
          <div style={{ display: "none" }} className={profileStyle.profileData}>
            <div>
              <Image
                src={channel}
                alt="channelimage"
                style={device === "mobile" ? { marginLeft: 17 } : null}
                className={profileStyle.profilePicture}
              />
            </div>

            <div>
              <p
                style={device === "mobile" ? { marginRight: 34 } : null}
                className={profileStyle.editBtn1}
                onClick={isEditingColor ? handleSaveColor : handleEditColor}
              >
                {isEditingColor ? "Save" : "Edit"}
              </p>
            </div>
          </div>

          {isEditingColor && (
            <div className={profileStyle.colorPickerContainer}>
              <div
                className={profileStyle.customSketchPicker}
                style={
                  device === "mobile"
                    ? {
                        position: "absolute",
                        right: "24px",
                        top: "128px",
                        zIndex: "1000",
                      }
                    : {
                        position: "absolute",
                        right: "564px",
                        top: "119px",
                        zIndex: "1000",
                      }
                }
              >
                <SketchPicker color={color} onChange={handleColorChange} />
              </div>
            </div>
          )}

          {/* about details */}
          <div className={profileStyle.mainContainer} style={{ marginTop: 15 }}>
            <div
              className={createProfileStyle.aboutDtailsBox}
              style={{ marginTop: 15, width: "90%" }}
            >
              <form onSubmit={handleSubmit}> 
                <div className={profileStyle.heading}>
                  <p className={profileStyle.headStyle}>About</p>
                  <button className={profileStyle.editBtn} type="submit">
                    {loading ? <Loader /> : <span> Save </span>}
                  </button>
                </div>
                <p className={createProfileStyle.inputTextBox}>
                  <textarea
                    className={createProfileStyle.textarea}
                    placeholder=""
                    name="about"
                    onChange={handleChange}
                  >
                    {formData.about}
                  </textarea>
                </p>
                <div className={createProfileStyle.contentBox}>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>7</p>
                    <p className={channelStyles.contentStyle}>Posts</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>3</p>
                    <p className={channelStyles.contentStyle}>Editions</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>27</p>
                    <p className={channelStyles.contentStyle}>Articles</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>6</p>
                    <p className={channelStyles.contentStyle}>Following</p>
                  </div>
                  <div
                    className={`${profileStyle.box_1} ${createProfileStyle.box_1}`}
                  >
                    <p className={channelStyles.numStyle}>1275</p>
                    <p className={channelStyles.contentStyle}>Followers</p>
                  </div>
                </div>

                <div
                  style={{
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 7,
                    marginBottom: 7,
                  }}
                />

                <div className={profileStyle.shareChannelBox}>
                  <p className={profileStyle.channelName}>Share channel</p>
                  <p className={profileStyle.socialIcons}>
                    <Link
                      href="#"
                      style={{
                        backgroundColor: "black",
                        padding: 5,
                        paddingTop: 8,
                        width: 27,
                        height: 27,
                        borderRadius: 14,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <span>
                        <FaInstagram size={25} style={{ color: "#fff" }} />
                      </span>
                    </Link>
                    <Link
                      href="#"
                      style={{
                        backgroundColor: "black",
                        padding: 5,
                        paddingTop: 8,
                        width: 27,
                        height: 27,
                        borderRadius: 14,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <span>
                        <FaTelegram size={25} style={{ color: "#fff" }} />
                      </span>
                    </Link>
                    <Link
                      href="#"
                      style={{
                        backgroundColor: "black",
                        padding: 5,
                        paddingTop: 8,
                        width: 27,
                        height: 27,
                        borderRadius: 14,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <span style={{ fontSize: "17px" }}>
                        <AiFillTwitterCircle
                          size={25}
                          style={{ color: "#fff" }}
                        />
                      </span>
                    </Link>
                    <Link
                      href="#"
                      style={{
                        backgroundColor: "black",
                        padding: 5,
                        paddingTop: 8,
                        width: 27,
                        height: 27,
                        borderRadius: 14,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <span>
                        <FaFacebook size={25} style={{ color: "#fff" }} />
                      </span>
                    </Link>
                  </p>
                </div>

                <div
                  style={{
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 7,
                    marginBottom: 7,
                  }}
                />

                <div className={createProfileStyle.fieldsRow}>
                  <span>Genre</span>
                  <select className={createProfileStyle.selecteInputField} name="genre"  value={formData.genre}
                    onChange={handleChange}>
                    <option>Art</option>
                    <option>Design</option>
                    <option>Hobbies</option>
                    <option>At Home</option>
                    <option>Entertainment</option>
                    <option>Gaming</option>
                  </select>
                </div>

                <div className={createProfileStyle.fieldsRow}>
                  <span>Subgenre</span>
                  <input
                    type="text"
                    name="subGenre"
                    value={formData.subGenre}
                    className={createProfileStyle.HeadInputField_1}
                    placeholder="-"
                    onChange={handleChange}
                  />
                </div>

                <div
                  style={{
                    height: 1,
                    backgroundColor: "#70707019",
                    marginTop: 7,
                    marginBottom: 7,
                  }}
                />

                <div className={profileStyle.channelGenre}>
                  <div className={createProfileStyle.fieldsRow}>
                    <span>Profile</span>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <input
                        type="text"
                        name="profileTitle"
                        value={formData.profileTitle}
                        className={createProfileStyle.HeadInputField}
                        placeholder="@Home_Beautiful"
                        onChange={handleChange}
                      />

                      <input
                        type="text"
                        style={{ fontStyle: "italic" }}
                        name="profileHandle"
                        value={formData.profileHandle}
                        className={createProfileStyle.inputField}
                        placeholder="@HomeBeautifulAus"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div
                    className={createProfileStyle.fieldsRow}
                    style={{ marginTop: 20 }}
                  >
                    <span>Name</span>
                    <input
                      type="text"
                      name="channelName"
                      value={formData.channelName}
                      className={createProfileStyle.inputField}
                      placeholder="Home Beautiful"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className={createProfileStyle.fieldsRow}>
                    <span>URL</span>
                    <input
                      type="text"
                      name="url"
                      style={{ fontStyle: "italic" }}
                      className={createProfileStyle.inputField}
                      placeholder="homebeautiful.com.au"
                      onChange={handleChange}
                    />
                  </div>

                  <div className={createProfileStyle.fieldsRow}>
                    <span>Email</span>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      style={{ fontStyle: "italic" }}
                      className={createProfileStyle.inputField}
                      placeholder="feedback@homebeautiful.com.au"
                      onChange={handleChange}
                    />
                  </div>

                  <div className={createProfileStyle.fieldsRow}>
                    <span>Phone</span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      className={createProfileStyle.inputField}
                      placeholder="-"
                      onChange={handleChange}
                    />
                  </div>

                  <div className={createProfileStyle.fieldsRow}>
                    <span>Location</span>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      className={createProfileStyle.inputField}
                      placeholder="Sydney, Australia"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </form>

              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div className={profileStyle.shareChannelBox}>
                <p className={profileStyle.channelName}>Library</p>
              </div>

              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />
              <div
                style={{
                  boxShadow: shadow1 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                  padding: shadow1 ? "4px" : "0",
                }}
              >
                <div className={profileStyle.heading}>
                  <p className={profileStyle.publication}>PUBLICATIONS – 3</p>
                  {arrowUp1 ? (
                    <>
                      <Image
                        src={uparrow}
                        alt="uparrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleArrowClick1}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={downarrow}
                        alt="downarrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleDownArrowClick1}
                      />
                    </>
                  )}
                </div>
                {showDialog1 && (
                  <div className={profileStyle.dialogBox}>
                    <table className={profileStyle.table}>
                      <tbody>
                        <tr className={profileStyle.tableRow}>
                          <td className={profileStyle.td1}>Special update</td>
                          <td className={profileStyle.td2}>Festive Napkins</td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>Competition Time</td>
                          <td className={profileStyle.td2}>
                            Win our featured cushions
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>20% off Offer</td>
                          <td className={profileStyle.td2}>
                            With LoungeLife sofas
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td colSpan="3">
                            <button className={profileStyle.loadMoreBtn}>
                              Load More Content
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div
                style={{
                  boxShadow: shadow2 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                  padding: shadow2 ? "4px" : "0",
                }}
              >
                <div className={profileStyle.heading}>
                  <p className={profileStyle.publication}>
                    Summer 2023, June 1 2023
                  </p>
                  {arrowUp2 ? (
                    <>
                      <Image
                        src={uparrow}
                        alt="uparrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleArrowClick2}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={downarrow}
                        alt="downarrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleDownArrowClick2}
                      />
                    </>
                  )}
                </div>
                {showDialog2 && (
                  <div className={profileStyle.dialogBox}>
                    <table className={profileStyle.table}>
                      <tbody>
                        <tr className={profileStyle.tableRow}>
                          <td className={profileStyle.td1}>Special update</td>
                          <td className={profileStyle.td2}>Festive Napkins</td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>Competition Time</td>
                          <td className={profileStyle.td2}>
                            Win our featured cushions
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>20% off Offer</td>
                          <td className={profileStyle.td2}>
                            With LoungeLife sofas
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td colSpan="3">
                            <button className={profileStyle.loadMoreBtn}>
                              Load More Content
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div
                style={{
                  boxShadow: shadow3 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                  padding: shadow3 ? "4px" : "0",
                }}
              >
                <div className={profileStyle.heading}>
                  <p className={profileStyle.publication}>
                    Spring 2023, March 1 2023
                  </p>
                  {arrowUp3 ? (
                    <>
                      <Image
                        src={uparrow}
                        alt="uparrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleArrowClick3}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={downarrow}
                        alt="downarrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleDownArrowClick3}
                      />
                    </>
                  )}
                </div>
                {showDialog3 && (
                  <div className={profileStyle.dialogBox}>
                    <table className={profileStyle.table}>
                      <tbody>
                        <tr className={profileStyle.tableRow}>
                          <td className={profileStyle.td1}>Special update</td>
                          <td className={profileStyle.td2}>Festive Napkins</td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>Competition Time</td>
                          <td className={profileStyle.td2}>
                            Win our featured cushions
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>20% off Offer</td>
                          <td className={profileStyle.td2}>
                            With LoungeLife sofas
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td colSpan="3">
                            <button className={profileStyle.loadMoreBtn}>
                              Load More Content
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div
                style={{
                  boxShadow: shadow4 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                  padding: shadow4 ? "4px" : "0",
                }}
              >
                <div className={profileStyle.heading}>
                  <p className={profileStyle.publication}>
                    Winter 2022, December 1 2022
                  </p>
                  {arrowUp4 ? (
                    <>
                      <Image
                        src={uparrow}
                        alt="uparrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleArrowClick4}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={downarrow}
                        alt="downarrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleDownArrowClick4}
                      />
                    </>
                  )}
                </div>
                {showDialog4 && (
                  <div className={profileStyle.dialogBox}>
                    <table className={profileStyle.table}>
                      <tbody>
                        <tr className={profileStyle.tableRow}>
                          <td className={profileStyle.td1}>Special update</td>
                          <td className={profileStyle.td2}>Festive Napkins</td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>Competition Time</td>
                          <td className={profileStyle.td2}>
                            Win our featured cushions
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>20% off Offer</td>
                          <td className={profileStyle.td2}>
                            With LoungeLife sofas
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td colSpan="3">
                            <button className={profileStyle.loadMoreBtn}>
                              Load More Content
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div
                style={{
                  boxShadow: shadow5 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                  padding: shadow5 ? "4px" : "0",
                }}
              >
                <div className={profileStyle.heading}>
                  <p className={profileStyle.publication}>POSTS – 7</p>
                  {arrowUp5 ? (
                    <>
                      <Image
                        src={uparrow}
                        alt="uparrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleArrowClick5}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={downarrow}
                        alt="downarrow"
                        className={profileStyle.arrowIcon}
                        onClick={handleDownArrowClick5}
                      />
                    </>
                  )}
                </div>
                {showDialog5 && (
                  <div className={profileStyle.dialogBox}>
                    <table className={profileStyle.table}>
                      <tbody>
                        <tr className={profileStyle.tableRow}>
                          <td className={profileStyle.td1}>Special update</td>
                          <td className={profileStyle.td2}>Festive Napkins</td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>Competition Time</td>
                          <td className={profileStyle.td2}>
                            Win our featured cushions
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td className={profileStyle.td1}>20% off Offer</td>
                          <td className={profileStyle.td2}>
                            With LoungeLife sofas
                          </td>
                          <td className={profileStyle.td3}>Edit</td>
                        </tr>
                        <tr>
                          <td colSpan="3">
                            <button className={profileStyle.loadMoreBtn}>
                              Load More Content
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              <div className={profileStyle.heading}>
                <p className={profileStyle.parafont}>VersoRewards</p>
                <p className={profileStyle.parafont1}>Points</p>
                <p onClick={handleArrowClick6}>
                  {arrowUp ? (
                    <Image
                      src={uparrow}
                      alt="uparrow"
                      className={profileStyle.arrowIcon}
                    />
                  ) : (
                    <Image
                      src={downarrow}
                      alt="downarrow"
                      className={profileStyle.arrowIcon}
                    />
                  )}
                </p>
              </div>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#70707019",
                  marginTop: 7,
                  marginBottom: 7,
                }}
              />

              {view && (
                <>
                  <div className={profileStyle.viewcontentBox}>
                    <div
                      className={`${profileStyle.viewcontentBox} ${profileStyle.col1}`}
                    >
                      <Image
                        src={img1}
                        alt="image"
                        className={profileStyle.setImage}
                      />
                      &nbsp;
                      <p className={profileStyle.viewcontent}>Joel Bookzs</p>
                    </div>
                    <p
                      className={`${profileStyle.viewcontent} ${profileStyle.col2}`}
                    >
                      124
                    </p>
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      className={profileStyle.menu}
                    />
                  </div>
                  <div
                    style={{
                      height: 1,
                      backgroundColor: "#70707019",
                      marginTop: 7,
                      marginBottom: 7,
                    }}
                  />
                  {/* Add more viewContent details here */}
                  <div className={profileStyle.viewcontentBox}>
                    <div
                      className={`${profileStyle.viewcontentBox} ${profileStyle.col1}`}
                    >
                      <Image
                        src={img1}
                        alt="image"
                        className={profileStyle.setImage}
                      />
                      &nbsp;
                      <p className={profileStyle.viewcontent}>
                        Colours Magazine
                      </p>
                    </div>
                    <p
                      className={`${profileStyle.viewcontent} ${profileStyle.col2}`}
                    >
                      187
                    </p>
                    <Image
                      src={menuicon}
                      alt="menuicon"
                      className={profileStyle.menu}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default UpdateProfile;
