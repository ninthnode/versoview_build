import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Image,
  Flex,
  Box,
  Text,
  Spinner,
} from "@chakra-ui/react";
import "./style.css";
import useDeviceType from "@/components/useDeviceType";

const PdfFlipBookModal = ({ pdfFiles, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const deviceType = useDeviceType();

  useEffect(() => {
    const loadPages = async () => {
      setLoading(true);
      let allPages = [];
      for (let pdfIndex = 0; pdfIndex < pdfFiles.length; pdfIndex++) {
        const fileUrl = pdfFiles[pdfIndex];
        const pdf = await pdfjs.getDocument(fileUrl).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          allPages.push({ fileUrl, pageNum, pdfIndex });
        }
      }
      setPages(allPages);
      setLoading(false);
    };

    setPages([]);
    loadPages();
  }, [pdfFiles]);

  return (
    <Box>
      <Flex cursor="pointer" onClick={onOpen}>
        <Image src="../assets/book.svg" h="1.2rem" w="1.4rem" />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" height="100%">
        <ModalOverlay />
        <ModalContent height="90vh" maxH="90vh" m="auto">
          <ModalHeader mt="2">{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody minH="50vh" height="100%" overflow="hidden" mt={4}>
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bg={{base:"#fff",md:"#222"}}
              p={4}
              borderRadius="md"
              minH="550"
            >
              {loading ? (
                <Flex direction="column" align="center">
                  <Spinner size="xl" color={{base:"#333",md:"#fff"}} />
                  <Text color={{base:"#333",md:"#fff"}} mt={2}>
                    Loading PDF...
                  </Text>
                </Flex>
              ) : pages.length > 0 ? (
                <HTMLFlipBook
                  maxWidth={400}
                  maxHeight={500}
                  height={500}
                  width={400}
                  size={deviceType != "phone"?"stretch":'fixed'}
                  enableBackground={true}
                  pageBackground="#333"
                  autoSize={true}
                  showCover={true}
                  usePortrait={true}
                  mobileScrollSupport={true}
                  flippingTime={1000}
                  clickEventForward={false}
                  useMouseEvents={true}
                  style={{ margin: "auto" }}
                  drawShadow={true}
                  maxShadowOpacity={0.5}
                  isClickFlip={false}
                >
                  {pages.map((page, index) => (
                    <div key={index}>
                      <Document file={page.fileUrl}>
                        <Page pageNumber={page.pageNum} />
                      </Document>
                    </div>
                  ))}
                </HTMLFlipBook>
              ) : (
                <Text textAlign="center" color="white">
                  No pages found.
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PdfFlipBookModal;
