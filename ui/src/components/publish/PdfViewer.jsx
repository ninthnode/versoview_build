import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Spinner, Text } from "@chakra-ui/react";
import './styles.css'
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const PdfViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

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
