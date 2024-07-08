import React, { useState } from "react";
import Navbar from "../components/top-navbar";
import styles from "../styles/publish-page.module.css";
import LeftSidebar from "../components/left-sidebar";
import PdfViewer from "../components/pdf-viewer";
import FormSection from "../components/post-form";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import desktopLogo from "../public/images/desktop-logo.svg";

const PostPage = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  console.log(selectedPdf, "i am inside main page");

  const handlePdfSelected = (pdfFile) => {
    setSelectedPdf(pdfFile);
  };

  return (
    <div className={styles.container}>

      <div className={globalStyles.onlyDesktop}>
        <Image
            src={desktopLogo}
            alt="desktopLogo"
            style={{width:231, height:36, marginLeft:110, marginTop:40}}
          />
      </div>

      <div className={styles.mainContent}>
        <LeftSidebar onPdfSelected={handlePdfSelected} />
        {selectedPdf ? (
          <PdfViewer pdfFile={selectedPdf} />
        ) : (
          <PdfViewer pdfFile={selectedPdf} />
        )}
        <FormSection />
      </div>
    </div>
  );
};

export default PostPage;
