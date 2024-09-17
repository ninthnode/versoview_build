import React, { useState } from "react";
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
  Text
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import './style.css';
const PdfFlipBookModal = ({ pdfFile }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <>
      {/* <Button onClick={onOpen}>Open PDF</Button> */}
      <Flex cursor="pointer" onClick={onOpen}>
            <Image src="../assets/chat-icon.png" h="1.2rem" w="1.4rem" />
            <Text ml="1">0</Text>
          </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" height="100%">
        <ModalOverlay />
        <ModalContent height="fit-content" m='0'>
          <ModalHeader mt='2'>PDF Edition</ModalHeader>
          <ModalCloseButton />
          <ModalBody height="100%">
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <HTMLFlipBook
                width={550}
                height={733}
                size="stretch"
                minWidth={315}
                autoSize={true}
                showCover={false}
                usePortrait={true}
                mobileScrollSupport={true}
                flippingTime={1000}
                clickEventForward={false}
                useMouseEvents={true}
                onUpdate={(e) => {
                  console.log(e);
                }}
                style={{ margin: 'auto' }}
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
    </>
  );
};

export default PdfFlipBookModal;
