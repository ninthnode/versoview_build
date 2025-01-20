// console.log(state.object.pages.currentPageIndex)
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Flex,
  Text
} from "@chakra-ui/react";
import "./style.css";

const PdfFlipBookModal = ({ pdfFiles, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [numPagesList, setNumPagesList] = useState([]);
  const [loadedPages, setLoadedPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPagesList((prev) => {
      const updatedList = [...prev];
      updatedList[currentPdfIndex] = numPages;
      return updatedList;
    });

    // Load initial pages for the first PDF
    if (currentPdfIndex === 0) {
      const pages = Array.from({ length: Math.min(10, numPages) }, (_, i) => ({
        pdfIndex: currentPdfIndex,
        pageNumber: i + 1
      }));
      setLoadedPages(pages);
    }
  };

  const handlePageChange = (state) => {
    const { currentPageIndex } = state.object.pages;
    setCurrentPageIndex(currentPageIndex);

    const totalPagesViewed = loadedPages.length;

    // If the user reaches the last page of the current PDF, load the next PDF's pages
    if (
      currentPageIndex >= totalPagesViewed - 1 &&
      currentPdfIndex < pdfFiles.length - 1
    ) {
      const nextPdfIndex = currentPdfIndex + 1;
      const nextNumPages = numPagesList[nextPdfIndex] || 0;

      const newPages = Array.from(
        { length: Math.min(10, nextNumPages) },
        (_, i) => ({
          pdfIndex: nextPdfIndex,
          pageNumber: i + 1
        })
      );

      setLoadedPages((prev) => [...prev, ...newPages]);
      setCurrentPdfIndex(nextPdfIndex);
    }

    // Handle going back to the previous PDF
    if (currentPageIndex === 0 && currentPdfIndex > 0) {
      const prevPdfIndex = currentPdfIndex - 1;
      const prevNumPages = numPagesList[prevPdfIndex] || 0;

      const prevPages = Array.from(
        { length: Math.min(10, prevNumPages) },
        (_, i) => ({
          pdfIndex: prevPdfIndex,
          pageNumber: i + 1
        })
      );

      setLoadedPages(prevPages.concat(loadedPages));
      setCurrentPdfIndex(prevPdfIndex);
    }
  };

  return (
    <>
      <Flex cursor="pointer" onClick={onOpen}>
        <Image src="../assets/book.svg" h="1.2rem" w="1.4rem" />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" height="100%">
        <ModalOverlay />
        <ModalContent height="fit-content" m="0">
          <ModalHeader mt="2">{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody height="100%">
            {loadedPages.map((page, index) => (
              <Document
                key={`pdf-${page.pdfIndex}-page-${page.pageNumber}`}
                file={pdfFiles[0]}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <HTMLFlipBook
                  width={550}
                  height={733}
                  size="stretch"
                  minWidth={315}
                  autoSize
                  showCover={false}
                  usePortrait
                  mobileScrollSupport
                  flippingTime={1000}
                  clickEventForward={false}
                  useMouseEvents
                  onChangeState={handlePageChange}
                  style={{ margin: "auto" }}
                  drawShadow
                  maxShadowOpacity={0.5}
                  isClickFlip={false}
                >
                  <div key={`page-${page.pageNumber}`}>
                    <Page pageNumber={page.pageNumber} />
                  </div>
                </HTMLFlipBook>
              </Document>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PdfFlipBookModal;
