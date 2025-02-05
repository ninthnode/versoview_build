import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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
  Box,
  Text,
  useEditable,
} from "@chakra-ui/react";
import "./style.css";
const PdfFlipBookModal = ({ pdfFiles, title,numberOfPages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pdfNum, setPdfNum] = useState(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  function getPageRange(pagenum, itemsPerPage) {
    const start = (pagenum - 1) * itemsPerPage + 1;
    const end = start + itemsPerPage - 1;
    return `${pdfCurrentPage} - ${pdfCurrentPage + 1}`;
  }

  return (
    <Box>
      <Flex cursor="pointer" onClick={onOpen}>
        <Image src="../assets/book.svg" h="1.2rem" w="1.4rem" />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" height="100%">
        <ModalOverlay />
        <ModalContent height="fit-content" m="0">
          <ModalHeader mt="2">{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody minH="80vh" height="100%">
            <Flex justifyContent="space-between" mb="2">
              <Button
                variant="primary"
                isDisabled={pdfNum==0}
                onClick={() => {
                  setPdfNum(pdfNum - 1);
                  setPdfCurrentPage((pdfNum - 1) * 10 + 1);
                }}
              >
                {"<"} Previous
              </Button>
              <Text>Page No : {getPageRange(pdfNum + 1, 10)}</Text>
              {/* {console.log(pdfNum+1,pdfFiles.length)} */}
              <Button
                variant="primary"
                isDisabled={pdfNum+1==pdfFiles.length}
                onClick={() => {
                  setPdfNum(pdfNum + 1);
                  setPdfCurrentPage((pdfNum + 1) * 10 + 1);
                }}
              >
                Next {">"}
              </Button>
            </Flex>

            <Document
              file={pdfFiles[pdfNum]}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <HTMLFlipBook
                width={550}
                height={733}
                size="stretch"
                minWidth={315}
                autoSize={true}
                showCover={false}
                usePortrait={true}
                mobileScrollSupport={true}
                onChangeState={(e) => {
                  setPdfCurrentPage(
                    pdfNum * 10 + e.object.pages.currentPageIndex + 1
                  );
                }}
                onUpdate={(e) => {
                  console.log(e)
                }}
                flippingTime={1000}
                clickEventForward={false}
                useMouseEvents={true}
                style={{ margin: "auto" }}
                // swipeDistance={30}
                drawShadow={true}
                maxShadowOpacity={0.5}
                isClickFlip={false}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`}>
                    <Page pageNumber={index + 1} />
                  </div>
                ))}
              </HTMLFlipBook>
            </Document>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PdfFlipBookModal;
