import { useState,useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Spinner, Text } from "@chakra-ui/react";
// import './styles.css'
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const PdfViewer = ({ pdfUrl,size='sm' }) => {
  const [numPages, setNumPages] = useState(null);
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  const sizes = {
    sm: { width: '100%', height: '200px' },
    md: { width: '300px', height: '400px' },
  };

  useEffect(() => {
    const { width, height } = sizes[size] || sizes.sm;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .react-pdf__Page__canvas {
        width: ${width} !important;
        height: ${height} !important;
        object-fit: contain !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [size]);
  return (
    <Box>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Spinner />}
      >
        <Page pageNumber={1} className="pdf-page" />
      </Document>
    </Box>
  );
};

export default PdfViewer;
