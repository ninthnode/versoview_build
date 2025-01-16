import { useState,useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Flex, Box, Image } from "@chakra-ui/react";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import "./styles.css";

const LibraryViewer = ({ file, onImagesCaptured, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Helper function to combine two canvases into one image
  const combineCanvases = (canvas1, canvas2) => {
    const width = canvas1.width + (canvas2 ? canvas2.width : 0);
    const height = Math.max(canvas1.height, canvas2 ? canvas2.height : 0);

    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = width;
    combinedCanvas.height = height;

    const ctx = combinedCanvas.getContext("2d");
    ctx.drawImage(canvas1, 0, 0);
    if (canvas2) {
      ctx.drawImage(canvas2, canvas1.width, 0);
    }

    return combinedCanvas.toDataURL("image/png"); // Return as image
  };

  const handlePageClick = (pageNumber, isTwoPage = false) => {
    const canvas1 = document.querySelector(
      `[data-page-number='${pageNumber}'] canvas`
    );
    const canvas2 = isTwoPage
      ? document.querySelector(`[data-page-number='${pageNumber + 1}'] canvas`)
      : null;
    if (canvas1) {
      const image = combineCanvases(canvas1, canvas2);
      return image;
    }
  };

  const renderPages = () => {
    const pages = [];
    let i = 1;
  
    // Render the first page alone
    if (i <= numPages) {
      const PageNumber = i;
      pages.push(
        <Flex
          key={i}
          border="1px solid #333"
          w="fit-content"
          onClick={() => handlePageClick(PageNumber, false)}
          cursor="pointer"
          _hover={{ boxShadow:'lg' }}
        >
          <Page pageNumber={i} />
        </Flex>
      );
      i++;
    }
  
    // Render the rest in pairs
    while (i <= numPages) {
      const firstPageNumber = i;
      const secondPageNumber = i + 1 <= numPages ? i + 1 : null;
  
      pages.push(
        <Flex
          key={firstPageNumber}
          gap="0"
          border="1px solid #333"
          w="fit-content"
          onClick={() =>
            handlePageClick(firstPageNumber, secondPageNumber !== null)
          }
          cursor="pointer"
          _hover={{ boxShadow:'lg' }}
        >
          <Page pageNumber={firstPageNumber} />
          {secondPageNumber && <Page pageNumber={secondPageNumber} />}
        </Flex>
      );
  
      // If there was a second page in the pair, increment by 2; otherwise, just increment by 1
      i += secondPageNumber ? 2 : 1;
    }
  
    return pages;
  };
  const captureAllPages = () => {
    const images = [];
    for (let i = 1; i <= numPages; i++) {
      const image = handlePageClick(i);
      if (image) {
        images.push(image);
      }
    }
    setCapturedImages(images); // Store the captured images in state
    if (onImagesCaptured) {
      onImagesCaptured(images); // Pass captured images to the parent component
    }
  };
  useEffect(() => {
    if (numPages) {
      // After document load success, capture images
      setTimeout(captureAllPages, 40000); // Slight delay to ensure pages are rendered
    }
  }, [numPages]);
  return (
    <>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Flex gap="4" wrap="wrap" justify='center' mb='4'>{renderPages()}</Flex>
      </Document>
    </>
  );
};

export default LibraryViewer;
