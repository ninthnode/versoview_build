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
const PdfFlipBookModal = ({ pdfFiles, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pdfNum, setPdfNum] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [showPrevBtn, setShowPrevBtn] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  useEffect(() => {
    if(pdfNum > 0)
      setShowPrevBtn(true);
    else
    setShowPrevBtn(false);
    if(pdfNum +1 ==pdfFiles.length)
      setShowNextBtn(false);
    else
    setShowNextBtn(true);

  }, [pdfNum])
  
  function getPageRange(pagenum, itemsPerPage) {
    const start = (pagenum - 1) * itemsPerPage + 1;
    const end = start + itemsPerPage - 1;
    return `${start}/${end}`;
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
            <Flex justifyContent="space-between" mb='2'>
              <Button
                variant="primary"
                isDisabled={!showPrevBtn}
                onClick={() => {
                  setPdfNum(pdfNum - 1);
                }}
              >
                {"<"}
              </Button>
              <Text>
                Page No - {getPageRange(pdfNum+1, 10)}
              </Text>
              <Button
                variant="primary"
                disabled={!showNextBtn}
                onClick={() => {
                  setPdfNum(pdfNum + 1);
                }}
              >
                {">"}
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
                  // if (
                  //   pdfNum < pdfFiles.length &&
                  //   e.object.pages.currentPageIndex == 8
                  // )
                  //   setShowNextBtn(true);
                  // if (pdfNum != 0 && e.object.pages.currentPageIndex > 1)
                  //   setShowPrevBtn(false);
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
