// import { useState, useEffect, useRef } from "react";
// import styles from "../styles/upload.module.css";
// import Image from "next/image";
// import logo from "../public/images/logo.svg";
// import cameraIcon from "../public/images/camera-icon.svg";
// import roundedRect from "../public/images/rounded-rect.svg";
// import gallary from "../public/images/gallary.svg";
// import menuicon from "../public/images/menu.svg";
// import BottomNav from "../components/bottom-nav";
// import LeftSidebar from "../components/left-sidebar";
// import PdfViewer from "../components/pdf-viewer";
// import FormSection from "../components/post-form";
// import styles1 from "../styles/publish-page.module.css";
// import globalStyles from "../styles/global.module.css";
// import desktopLogo from "../public/images/desktop-logo.svg";
// import postApi from "../api/post";
// import {ToastContainer,  toast } from "react-toastify";
// import Loader from '../components/loader';
// import { getSignedUrl, uploadFileToSignedUrl } from "../src/api";
// import "react-toastify/dist/ReactToastify.css";

// const UploadPage = () => {
//   const [loading, setLoading] = useState(false);
//   const [deviceType, setDeviceType] = useState(() => {
//     return typeof window !== "undefined" && window.innerWidth < 600
//       ? "mobile"
//       : "desktop";
//   });
//   const [postImageLink, setpostImageLink] = useState("");

//   const fileInputRef = useRef(null);

//   const handleCameraIconClick = () => {
//     fileInputRef.current.click();
//   };

//   // const [selectedPdf, setSelectedPdf] = useState(null);
//   const [formData, setFormData] = useState({
//     section: "",
//     subSection: "",
//     header: "",
//     standFirst: "",
//     credits: "",
//     bodyRichText: "",
//     mainImageURL: postImageLink || "",
//   });

//   const charLimits = {
//     section: 15,
//     subSection: 15,
//     header: 70,
//     standFirst: 150,
//     bodyRichText: 250,
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     if (!charLimits[name] || value.length <= charLimits[name]) {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         [name]: value,
//       }));
//     }
//   };

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     const content_type = file.type;
//     const key = `test/image/${file.name}`;
//     var imageUrl;
//     getSignedUrl({ key, content_type }).then((response) => {
//       imageUrl = response.data.fileLink;
//       setpostImageLink(imageUrl);
//       uploadFileToSignedUrl(
//         response.data.signedUrl,
//         file,
//         content_type,
//         null,
//         (response) => {
//           setFileLink(response.config.url);
//           setFormData((prevFormData) => ({
//             ...prevFormData,
//             mainImageURL: response.config.url,
//           }));
//         }
//       );
//     });
//   };
 
//   const [successMessage, setsuccessMessage] = useState("");
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     formData.mainImageURL = postImageLink;
//     setLoading(true);
//     const data = await postApi(formData);
//     setLoading(false);

//     if (data.status === 201) {
//       toast.success("Post created successfully");
//       setTimeout(() => {
//         window.location.replace("/home");
//       }, 2000);
//     } else if (data.status === 401) {
//       toast.error(data.message);
//     }else {
//       setLoading(false);
//       toast.error("Something went wrong while creating the post");
//       setTimeout(() => {
//         window.location.replace("/publish");
//       }, 2000);
//     }
//   };

//   // const handlePdfSelected = (pdfFile) => {
//   //   setSelectedPdf(pdfFile);
//   // };

//   useEffect(() => {
//     const detectDeviceType = () => {
//       const width = window.innerWidth;

//       if (width < 600) {
//         setDeviceType("mobile");
//       } else {
//         setDeviceType("desktop");
//       }
//     };
//     const handleResize = () => {
//       detectDeviceType();
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return (
//     <>
//       <div className={`${styles.container} ${globalStyles.onlyMobileBlock} `}>
//         <form onSubmit={handleSubmit}>
//           <div className={styles.headingTop}>
//             <p>MAIN IMAGE</p>
//             <p>UPLOAD IMAGE</p>
//           </div>

//           <div className={styles.cameraIcon} onClick={handleCameraIconClick}>
//             <Image src={cameraIcon} alt="cameraicon" style={{ width: 50 }} />
//           </div>
//           <input
//             type="file"
//             accept="image/*"
//             ref={fileInputRef}
//             style={{ display: "none" }}
//             onChange={handleFileSelect}
//             maxLength={25}
//           />

//           <div className={styles.heading}>
//             <div>
//               <p>SECTION</p>
//               <input
//                 type="text"
//                 name="section"
//                 placeholder="Latest"
//                 className="publishInput"
//                 onChange={handleChange}
//                 maxLength={15}
//               />
//             </div>
//             <div>
//               <p>SUBSECTION(OPTIONAL)</p>
//               <input
//                 type="text"
//                 name="subSection"
//                 placeholder="NTFs"
//                 onChange={handleChange}
//                 maxLength={15}
//               />
//             </div>
//           </div>

//           <p className={styles.headStyle}>HEADER</p>
//           <textarea
//             className={styles.textarea1}
//             type="text"
//             name="header"
//             placeholder="BoredApeYatchClub v2 Launch Sell Out in Under Two Hours"
//             onChange={handleChange}
//             maxLength={70}
//           />
//           <p className={styles.headStyle}>STAND-FIRST</p>
//           <textarea
//             className={styles.textarea2}
//             type="text"
//             name="standFirst"
//             placeholder="Bored Ape Yacht Club became internet rock stars by 
//                 making NFTs of grungy simians that aren’t just viral images — they’re tickets to a whole new lifestyle"
//             onChange={handleChange}
//             maxLength={150}
//           />
//           <p className={styles.headStyle}>CREDITS</p>
//           <textarea
//             className={styles.textarea3}
//             type="text"
//             name="credits"
//             placeholder="Suzy Tan & Hadaway Smythe"
//             onChange={handleChange}
//           />
//           <div className={styles.editFeature}>
//             <p className={styles.pt}>π B I U $ TT tt Tt T¹ T1</p>
//             <p className={`${styles.pt} ${styles.display}`}>
//               <Image src={gallary} alt="gallaryicon" className={styles.img} />
//               &nbsp;&nbsp;
//               <Image src={menuicon} alt="menuicon" />
//             </p>
//           </div>
//           <p className={styles.headStyle}>BODY COPY</p>
//           <textarea
//             className={styles.textarea4}
//             type="text"
//             name="bodyRichText"
//             placeholder="Body Copy"
//             onChange={handleChange}
//             maxLength={250}
//           >
//           </textarea>

//           {successMessage ? (
//             <div
//               style={{
//                 color: "red",
//                 fontFamily: `sans-serif`,
//                 fontSize: "14px",
//               }}
//             >
//               {successMessage}
//             </div>
//           ) : (
//             ""
//           )}

//           <button
//             className={styles.btn}
//             style={{ marginBottom: 100 }}
//             type="submit"
//           >
//             {loading ? <Loader /> : <span> Save & Preview</span>}
//           </button>
//         </form>
//         <BottomNav activePage="publish" />
//       </div>

//         <div className={`${styles1.container} ${globalStyles.onlyDesktop}`}>
//         <div className={`${globalStyles.onlyDesktop} ${globalStyles.onlyDesktopBlock} ${globalStyles.topBarDesktop} ${globalStyles.hideOnMobile}`}>
//             <Image
//                 src={desktopLogo}
//                 alt="desktopLogo"
//                 className={globalStyles.logo}
                
//             />

//             <span style={{fontSize:28, fontFamily:'SF-SemiBold', marginTop:0, marginLeft:100}}>Home Beautiful</span>
//        </div>

//         <div className={styles1.mainContent}>
//           {/* <LeftSidebar onPdfSelected={handlePdfSelected} /> */}
//           <LeftSidebar />
//           {/* {selectedPdf ? ( */}
//             <PdfViewer />
//             {/* <PdfViewer pdfFile={selectedPdf} /> */}
//           {/* ) : ( */}
//             {/* <PdfViewer /> */}
//             {/* <PdfViewer pdfFile={selectedPdf} /> */}
//           {/* )} */}
//           <FormSection />
//         </div>
//       </div>
//       <ToastContainer />
//     </>
//   );
// };

// export default UploadPage;


import { useState, useEffect, useRef } from "react";
import styles from "../styles/upload.module.css";
import Image from "next/image";
import logo from "../public/images/logo.svg";
import cameraIcon from "../public/images/camera-icon.svg";
import closeIcon from "../public/images/logo.svg"; // import a close icon
import roundedRect from "../public/images/rounded-rect.svg";
import gallary from "../public/images/gallary.svg";
import menuicon from "../public/images/menu.svg";
import BottomNav from "../components/bottom-nav";
import LeftSidebar from "../components/left-sidebar";
import PdfViewer from "../components/pdf-viewer";
import FormSection from "../components/post-form";
import styles1 from "../styles/publish-page.module.css";
import globalStyles from "../styles/global.module.css";
import desktopLogo from "../public/images/desktop-logo.svg";
import {postApi} from "../api/postApi";
import {ToastContainer, toast } from "react-toastify";
import Loader from '../components/loader';
import { getSignedUrl, uploadFileToSignedUrl } from "../src/api";
import "react-toastify/dist/ReactToastify.css";

const UploadPage = () => {
  const [loading, setLoading] = useState(false);
 
  const [postImageLink, setpostImageLink] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); 

  const fileInputRef = useRef(null);

  const handleCameraIconClick = () => {
    fileInputRef.current.click();
  };

  const [formData, setFormData] = useState({
    section: "",
    subSection: "",
    header: "",
    standFirst: "",
    credits: "",
    bodyRichText: "",
    mainImageURL: postImageLink || "",
  });

  const charLimits = {
    section: 15,
    subSection: 15,
    header: 70,
    standFirst: 150,
    bodyRichText: 250,
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (!charLimits[name] || value.length <= charLimits[name]) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const content_type = file.type;
    const key = `test/image/${file.name}`;
    var imageUrl;
    getSignedUrl({ key, content_type }).then((response) => {
      imageUrl = response.data.fileLink;
      setpostImageLink(imageUrl);
      setUploadedImage(URL.createObjectURL(file)); // Set the uploaded image preview
      uploadFileToSignedUrl(
        response.data.signedUrl,
        file,
        content_type,
        null,
        (response) => {
          setFileLink(response.config.url);
          setFormData((prevFormData) => ({
            ...prevFormData,
            mainImageURL: response.config.url,
          }));
        }
      );
    });
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setpostImageLink("");
    setFormData((prevFormData) => ({
      ...prevFormData,
      mainImageURL: "",
    }));
  };

  const [successMessage, setsuccessMessage] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    formData.mainImageURL = postImageLink;
    setLoading(true);
    const data = await postApi(formData);
    setLoading(false);

    if (data.status === 201) {
      toast.success("Post created successfully");
      setTimeout(() => {
        window.location.replace("/home");
      }, 2000);
    } else if (data.status === 401) {
      toast.error(data.message);
    }else {
      setLoading(false);
      toast.error("Something went wrong while creating the post");
      setTimeout(() => {
        window.location.replace("/publish");
      }, 2000);
    }
  };


  return (
    <>
      <div className={`${styles.container} ${globalStyles.onlyMobileBlock} `}>
        <form onSubmit={handleSubmit}>
          <div className={styles.headingTop}>
            <p>MAIN IMAGE</p>
            <p>UPLOAD IMAGE</p>
          </div>

          <div className={styles.cameraIcon}>
            {uploadedImage ? (
              <div className={styles.uploadedImageContainer}>
                <Image src={uploadedImage} alt="uploadedImage" className={styles.postImage} width={256} height={256} />
                <button type="button" onClick={handleImageRemove} className={styles.closeButton}>
                  x
                </button>
              </div>
            ) : (
              <Image src={cameraIcon} alt="cameraicon"onClick={handleCameraIconClick}  width = {50} height={50}/>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <div className={styles.heading}>
            <div>
              <p>SECTION</p>
              <input
                type="text"
                name="section"
                placeholder="Latest"
                className="publishInput"
                onChange={handleChange}
                maxLength={15}
              />
            </div>
            <div>
              <p>SUBSECTION(OPTIONAL)</p>
              <input
                type="text"
                name="subSection"
                placeholder="NTFs"
                onChange={handleChange}
                maxLength={15}
              />
            </div>
          </div>

          <p className={styles.headStyle}>HEADER</p>
          <textarea
            className={styles.textarea1}
            type="text"
            name="header"
            placeholder="BoredApeYatchClub v2 Launch Sell Out in Under Two Hours"
            onChange={handleChange}
            maxLength={70}
          />
          <p className={styles.headStyle}>STAND-FIRST</p>
          <textarea
            className={styles.textarea2}
            type="text"
            name="standFirst"
            placeholder="Bored Ape Yacht Club became internet rock stars by 
                making NFTs of grungy simians that aren’t just viral images — they’re tickets to a whole new lifestyle"
            onChange={handleChange}
            maxLength={150}
          />
          <p className={styles.headStyle}>CREDITS</p>
          <textarea
            className={styles.textarea3}
            type="text"
            name="credits"
            placeholder="Suzy Tan & Hadaway Smythe"
            onChange={handleChange}
          />
          <div className={styles.editFeature}>
            <p className={styles.pt}>π B I U $ TT tt Tt T¹ T1</p>
            <p className={`${styles.pt} ${styles.display}`}>
              <Image src={gallary} alt="gallaryicon" className={styles.img} />
              &nbsp;&nbsp;
              <Image src={menuicon} alt="menuicon" />
            </p>
          </div>
          <p className={styles.headStyle}>BODY COPY</p>
          <textarea
            className={styles.textarea4}
            type="text"
            name="bodyRichText"
            placeholder="Body Copy"
            onChange={handleChange}
            maxLength={250}
          >
          </textarea>

          {successMessage ? (
            <div
              style={{
                color: "red",
                fontFamily: `sans-serif`,
                fontSize: "14px",
              }}
            >
              {successMessage}
            </div>
          ) : (
            ""
          )}

          <button
            className={styles.btn}
            style={{ marginBottom: 100 }}
            type="submit"
          >
            {loading ? <Loader /> : <span> Save & Preview</span>}
          </button>
        </form>
        <BottomNav activePage="publish" />
      </div>

        <div className={`${styles1.container} ${globalStyles.onlyDesktop}`}>
        <div className={`${globalStyles.onlyDesktop} ${globalStyles.onlyDesktopBlock} ${globalStyles.topBarDesktop} ${globalStyles.hideOnMobile}`}>
            <Image
                src={desktopLogo}
                alt="desktopLogo"
                className={globalStyles.logo}
                
            />

            <span style={{fontSize:28, fontFamily:'SF-SemiBold', marginTop:0, marginLeft:100}}>Home Beautiful</span>
       </div>

        <div className={styles1.mainContent}>
          <LeftSidebar />
          <PdfViewer />
          <FormSection />
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default UploadPage;
