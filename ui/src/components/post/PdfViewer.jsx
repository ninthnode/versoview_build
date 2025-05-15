import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Spinner } from "@chakra-ui/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ pdfUrls }) => {
  const [pdfPages, setPdfPages] = useState([]);
  const [numPages, setNumPages] = useState({});
  const [pageStart, setPageStart] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    // Reset state when PDF URLs change
    setPdfPages([]);
    setNumPages({});
    setPageStart(0);
    setPdfLoading(true);
    
    if (pdfUrls && pdfUrls.length > 0) {
      loadInitialPdf();
    }
    
    return () => {
      setPdfPages([]);
    };
  }, [pdfUrls]);

  useEffect(() => {
    if (pdfUrls && pdfUrls.length > 0 && pageStart < pdfUrls.length) {
      setPdfPages((prev) => [...prev, pdfUrls[pageStart]]);
    }
  }, [pageStart, pdfUrls]);

  const loadInitialPdf = () => {
    if (pdfUrls && pdfUrls.length > 0) {
      setPdfPages([pdfUrls[0]]);
    }
  };

  const handleScroll = (e) => {
    if (
      e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 1 &&
      !pdfLoading &&
      pdfUrls &&
      pdfPages.length < pdfUrls.length
    ) {
      loadNextPdf();
    }
  };

  const onLoadSuccess = (pdf, index) => {
    setNumPages((prev) => ({ ...prev, [index]: pdf.numPages }));
    setPdfLoading(false);
    if (pdfUrls && pdfPages.length < pdfUrls.length) loadNextPdf();
  };

  const loadNextPdf = () => {
    setPageStart((prev) => prev + 1);
    setPdfLoading(true);
  };

  return (
    <Box
      w="60%"
      border="1px solid black"
      display={{ base: "none", md: "block" }}
      height="fit-content"
      pos="sticky"
      top="0"
    >
      <Heading fontSize="md" textAlign="center" my={4}>
        PDF PREVIEW
      </Heading>
      <Box border="1px solid #e2e8f0" h="100vh">
        <Flex align="flex-start" justifyContent="center" w="100%" h="full">
          <div
            style={{ width: "100%", height: "80vh", overflowY: "scroll" }}
            onScroll={handleScroll}
          >
            {pdfPages &&
              pdfPages.map((pdf, index) => (
                <div key={`pdf_${index}`}>
                  <Document
                    file={pdf}
                    onLoadSuccess={(pdf) => onLoadSuccess(pdf, index)}
                    renderMode={"svg"}
                  >
                    {Array.from(
                      new Array(numPages[index] || 0),
                      (_, pageIndex) => (
                        <Page
                          pageNumber={pageIndex + 1}
                          key={`page_${pageIndex + 1}`}
                        />
                      )
                    )}
                  </Document>
                </div>
              ))}
            {pdfLoading && (
              <Flex w="100%" justifyContent="center" h="100px">
                <Spinner size="md" />
              </Flex>
            )}
          </div>
        </Flex>
      </Box>
    </Box>
  );
};

export default PdfViewer; 