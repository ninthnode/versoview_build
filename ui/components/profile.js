import { useState, useEffect, useRef } from "react";
import styles from "../styles/home.module.css";
import { useRouter } from "next/router";
import profileStyle from "../styles/profile.module.css";
import channelStyles from "../styles/channel.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import channel from "../public/images/joen1.svg";
import menuicon from "../public/images/menu.svg";
import uparrow from "../public/images/uparrow.svg";
import downarrow from "../public/images/downarrow.svg";
import profileImage from "../public/images/defaultProfile.svg";
import book from "../public/images/book.svg";
import doublechat from "../public/images/doublechat.svg";
import img1 from "../public/images/img1.png";
import rarible from "../public/images/rarible.png";
import profilesData from "../profileData.json";
import {updateProfileApi} from "../api/authApi";
import { SketchPicker } from "react-color";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BiLogoFacebookSquare } from "react-icons/bi";
import { FaTelegram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { deviceType } from "react-device-detect";
import { FaInstagram } from "react-icons/fa";
import {getChannelByName} from "../api/authApi";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSignedProfileUrl, uploadFileToSignedUrl } from "../src/api";
import Loader from '../components/loader'
import {updateUserApi} from "../api/authApi";
import {jwtDecode} from 'jwt-decode';
import {FollowersList} from "../api/channelApi";
import {getAllPostByChannelId} from "../api/postApi";
import {FollowChannelList} from "../api/channelApi";

const Profile = ({ device }) => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showDialog1, setShowDialog1] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  const [showDialog3, setShowDialog3] = useState(false);
  const [showDialog4, setShowDialog4] = useState(false);
  const [showDialog5, setShowDialog5] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [color, setColor] = useState("#561ecb");
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
  const [profileUrl, setprofileUrl] = useState("")
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const channelId = profileData._id;
  const [totalPost, setTotalPost] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
 
  const router = useRouter();

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleShareChannel = async (item) => {
    try {
      const shareData = {
        url: `https://versoview.currlybraces.com/channel?channelId=${item}`, 
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        console.error("Share API is not supported");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  useEffect

  const handleLogout = () => {
    localStorage.clear();
    router.push({
      pathname: '/login',
    });
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if(isEditingColor)
      {
        setIsEditingColor(false);
      }
    };

    if (isEditingColor) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingColor]);

 
  const handleEditClick = () => {
    router.push({
      pathname: '/update-profile',
      query: { channelId: profileData._id }
    });
  };
 
  const publicationsData = [
    { id: 1, title: "Publication 1", content: "Content for Publication 1" },
    { id: 2, title: "Publication 2", content: "Content for Publication 2" },
    { id: 3, title: "Publication 3", content: "Content for Publication 3" },
    { id: 4, title: "Publication 4", content: "Content for Publication 4" },
    { id: 5, title: "Publication 5", content: "Content for Publication 5" },
  ];

  useEffect(() => { 
    const fetchData = async () => {
      try {
        const channelData = await getChannelByName();
        setProfileData(channelData);
        setColor(channelData.backgroundColor || "#561ecb"); 
      } catch (error) {
        console.error('Error fetching channel data:', error);
      }
    };

    const storedToken = localStorage.getItem('token');
     
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode(storedToken);
      setUserId(decodedToken.id);
    }

    fetchData();
  }, []);



  const updateColorInDatabase = async (newColor) => {
    const channelId = profileData._id;
    try {
      const response = await updateProfileApi({ channelId, backgroundColor: newColor });
    } catch (error) {
      console.error('Error updating color in database:', error);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleEditColor = () => {
    setIsEditingColor(!isEditingColor);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    updateColorInDatabase(newColor.hex);
  };

  const handleSaveColor = () => {
    setIsEditingColor(false);
    // toast.success("Color saved successfully");
  };

  const updateProfile = async (profileUrl) => {
    const channelId = profileData._id;
    try {
      const data = await updateProfileApi({ profileUrl, channelId });
      const userData = await updateUserApi({profileUrl, userId});
      setLoading(false);
      if (data && data.status === 200 && userData) {
        setLoading(false);
        toast.success("Profile updated successfully");
        window.location.replace("/profile")
      } else if (data && data.status === 404) {
        setLoading(false);
        toast.error(data.message);
      } else {
        setLoading(false);
        toast.error("Failed to update profile image");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile image");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const content_type = file.type;
    const key = `test/image/${file.name}`;
    
    getSignedProfileUrl({ key, content_type }).then((response) => {
      const imageUrl = response.data.fileLink;
      setLoading(true);
      uploadFileToSignedUrl(
        response.data.signedUrl,
        file,
        content_type,
        null,
        (response) => {
          if(response.status == 200){
            setprofileUrl(imageUrl);
            updateProfile(imageUrl);
            setFileLink(response.config.url);
            setLoading(false);
          }
        }
      );
    }) .catch((error) => {
      console.error("Error fetching signed URL:", error);
      setLoading(false); 
    });    
  }  

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllPostByChannelId({channelId});
        if (response.data) {
          setTotalPost(response.data.length);
        }

        const followers = await FollowersList({channelId});
        if(followers.status === 200){
          setFollowers(followers.data.length);
        }

        const following = await FollowChannelList();
        const totalFollowing = following.data.length;
        setFollowing(totalFollowing);

      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchData();
  }, [channelId]);

  return (
    <>
    {loading && <div className={profileStyle.loaderContainer}><Loader type="spinner" /></div>}
      <div className={profileStyle.container}>
        <div className={styles.heading} style={{ marginLeft: 15 }}>
          <h1
            style={device === "desktop" ? { marginTop: "18px" } : null}
            className={`${styles.boardingHead} ${profileStyle.boardingHead}`}
          >
            <Image src={logo} alt="logo" />
            <span style={{ marginLeft: 10 }}>Profile</span>
          </h1>
        </div>

        <div
          className={profileStyle.outerBox}
          style={{
            backgroundColor: color
          }}
        >

          {isEditingColor && (
            <div className={profileStyle.colorPickerContainer}>
              <div
                className={profileStyle.customSketchPicker}
                style={
                  device === "mobile"
                    ? {
                      position: "absolute",
                      right: "24px",
                      top: "142px",
                      zIndex: "1000",
                    }
                    : {
                      position: "absolute",
                      right: "105px",
                      top: "135px",
                      zIndex: "1000",
                    }
                }
              >
                <SketchPicker color={color} onChange={handleColorChange} />
              </div>
            </div>
          )}

          {/* about details */}
          <div className={profileStyle.mainContainer}>
            <div
              className={profileStyle.profileData}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <Image
                 src={profileData.channelIconImageUrl ? profileData.channelIconImageUrl : profileImage}
                alt="profileimage"
                width={59} 
                height={59} 
                style={{ ...(device === "mobile" ? { marginLeft: 0 } : null) , borderRadius: "5px"}}
                className={profileStyle.profilePicture}
                onClick={handleImageClick}
              />
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <button className={profileStyle.shareBtn} onClick={() => handleShareChannel(profileData._id)}>Share</button>
              <button className={profileStyle.editBtn1} onClick={isEditingColor ? handleSaveColor : handleEditColor}>
              {isEditingColor ? "Save" : "Edit"}
              </button>
              </div>

            </div>

            <div className={profileStyle.aboutDtailsBox}>
              <div className={profileStyle.heading}>
                <p className={profileStyle.headStyle}>About</p>
                <p
                  className={profileStyle.editBtn}
                  onClick={handleEditClick}
                >
                  Edit
                </p>
              </div>

              <p className={profileStyle.paraStyle}>
                {profileData.about || ""}
              </p>

              <div className={profileStyle.contentBox}>
                <div className={profileStyle.box_1}>
                  <p className={channelStyles.numStyle}>{totalPost}</p>
                  <p className={channelStyles.contentStyle}>Posts</p>
                </div>
                <div className={profileStyle.box_1}>
                  <p className={channelStyles.numStyle}>09</p>
                  <p className={channelStyles.contentStyle}>Editions</p>
                </div>
                <div className={profileStyle.box_1}>
                  <p className={channelStyles.numStyle}>09</p>
                  <p className={channelStyles.contentStyle}>Articles</p>
                </div>
                <div className={profileStyle.box_1}>
                  <p className={channelStyles.numStyle}>{following}</p>
                  <p className={channelStyles.contentStyle}>Following</p>
                </div>
                <div className={profileStyle.box_1}>
                  <p className={channelStyles.numStyle}>{followers}</p>
                  <p className={channelStyles.contentStyle}>Followers</p>
                </div>
              </div>
              <hr />

              <div className={profileStyle.shareChannelBox}>
                <p className={profileStyle.channelName}>Share channel</p>
                <p className={profileStyle.socialIcons}>
                  <Link href="#" 
                    style={{ backgroundColor: "black", padding:5, paddingTop:8,
                      width:27, height:27, borderRadius:14, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', marginRight:10 }}>
                    <span>
                      <FaInstagram size={25} style={{color:'#fff'}}/>
                    </span>
                  </Link>
                  <Link href="#" style={{ backgroundColor: "black", padding:5, paddingTop:8,
                      width:27, height:27, borderRadius:14, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', marginRight:10 }}>
                    <span>
                      <FaTelegram size={25} style={{color:'#fff'}}/>
                    </span>
                  </Link>
                  <Link href="#" style={{ backgroundColor: "black", padding:5, paddingTop:8,
                      width:27, height:27, borderRadius:14, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', marginRight:10 }}>
                    <span style={{ fontSize: "17px" }}>
                      <AiFillTwitterCircle size={25} style={{color:'#fff'}}/>
                    </span>
                  </Link>
                  <Link href="#" style={{ backgroundColor: "black", padding:5, paddingTop:8,
                      width:27, height:27, borderRadius:14, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', marginRight:10 }}>
                    <span>
                      <FaFacebook size={25} style={{color:'#fff'}}/>
                    </span>
                  </Link>
                </p>
              </div>
              <hr />

              <div className={profileStyle.channelGenre1}>
                <div className={profileStyle.head}>
                  <li className={profileStyle.list}>Genre</li>
                  <li className={profileStyle.list}>Subgenre</li>
                </div>
                <div className={profileStyle.head}>
                  <li className={profileStyle.list}>
                    {profileData.genre || "-"}
                  </li>
                  <li className={profileStyle.list}>
                    {profileData.subGenre || "-"}
                  </li>
                </div>
              </div>

              <hr />

              <div className={profileStyle.channelGenre1}>
                <div className={profileStyle.head}>
                  <li className={profileStyle.mainProfile}>Profile</li>
                  <li className={profileStyle.list}>Name</li>
                  <li className={profileStyle.list}>URL</li>
                  <li className={profileStyle.list}>Email</li>
                  <li className={profileStyle.list}>Phone</li>
                  <li className={profileStyle.list}>Location</li>
                </div>
                <div className={profileStyle.head}>
                  <li className={profileStyle.mainProfile_1}>
                    {profileData.profileTitle || "-"}
                    
                  </li>
                  <li className={profileStyle.mainSubProfile}>
                    {profileData.profileHandle || "-"}
                  </li>
                  <li className={profileStyle.list}>
                    {profileData.channelName || "-"}
                    
                  </li>
                  <li className={profileStyle.list}>
                  {profileData.url || "-"}
                  </li>
                  <li className={profileStyle.list}>
                    {profileData.email || "-"}
                  </li>
                  <li className={profileStyle.list}> {profileData.phone || "-"}</li>
                  <li className={profileStyle.list}> {profileData.location || "-"}</li>
                </div>
              </div>
              <hr />
              <div className={profileStyle.shareChannelBox}>
                <p className={profileStyle.channelName}>Library</p>
              </div>
              <hr />

              {publicationsData.map((publication) => (
              <>
  <div
    key={publication.id}
    style={{
      boxShadow: shadow1 ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
      padding: shadow1 ? "4px" : "0",
    }}
  >
    <div
      className={profileStyle.heading}
      onClick={arrowUp1 ? handleArrowClick1 : handleDownArrowClick1}
    >
      <p className={profileStyle.publication}>{publication.title}</p>
      {arrowUp1 ? (
        <Image
          src={uparrow}
          alt="uparrow"
          className={profileStyle.arrowIcon}
          onClick={handleArrowClick1}
        />
      ) : (
        <Image
          src={downarrow}
          alt="downarrow"
          className={profileStyle.arrowIcon}
          onClick={handleDownArrowClick1}
        />
      )}
    </div>
    {showDialog1 && (
      <div className={profileStyle.dialogBox}>
        <table className={profileStyle.table}>
          <tbody>
            <tr className={profileStyle.tableRow}>
              <td className={profileStyle.td1}>{publication.content}</td>
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
style={{ height: 1, backgroundColor: "#70707019", marginTop: 7, marginBottom:7 }}
/>

</>
))}
             


              <div className={profileStyle.heading} onClick={handleArrowClick6}>
                <p className={profileStyle.parafont}>VersoRewards</p>
                <p className={profileStyle.parafont1}>Points</p>
                <p >
                  {arrowUp ? (
                    <Image
                      src={uparrow}
                      alt="uparrow"
                      className={profileStyle.arrowIcon} style={{marginTop:-5}}
                    />
                  ) : (
                    <Image
                      src={downarrow}
                      alt="downarrow"
                      className={profileStyle.arrowIcon} style={{marginTop:-5}}
                    />
                  )}
                </p>
              </div>

              <div
                style={{ height: 1, backgroundColor: "#70707019", marginTop: 7, marginBottom:7 }}
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
                     style={{ height: 1, backgroundColor: "#70707019", marginTop: 7, marginBottom:7 }}
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
            <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Profile;


