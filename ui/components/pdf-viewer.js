import React, { useState, useEffect } from "react";
import styles from "../styles/pdf-viewer.module.css";
import Image from "next/image";
import getPdfSlides from "../api/post-api";

const PdfViewer = ({ pdfFile }) => {
  const [pdfSlides, setPdfSlides] = useState([
    "http://localhost:5001/public/uploads/resumes/page-1.png",
    "http://localhost:5001/public/uploads/resumes/page-1.png",
  ]);

  useEffect(() => {
    const loadPdfSlides = async () => {
      try {
        console.log(pdfFile);
        console.log("att---------------");
        const loadedPdfSlides = await getPdfSlides(pdfFile);
        // console.log(loadedPdfSlides, "here is the data");
        setPdfSlides(loadedPdfSlides.images);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    if (pdfFile) {
      loadPdfSlides();
    }
  }, [pdfFile]);

  console.log(pdfSlides);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.heading}>
        <span>PDF PREVIEW</span>
      </div>
      <div className={styles.crousalContainer}>
        <div className={styles.slidesContainer}>
          {pdfSlides.map((item, index) => (
            <div key={index}>
              <Image src={item} alt="pdfimage" width={100} height={100} />
            </div>
          ))}
        </div>
        {/* <div className={styles.pdfContainer}></div> */}
      </div>
    </div>
  );
};

export default PdfViewer;
