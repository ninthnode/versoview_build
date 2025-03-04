import React from "react";
import HTMLFlipBook from "react-pageflip";
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
} from "@chakra-ui/react";
import "./style.css";
import useDeviceType from "@/components/useDeviceType";

const PdfFlipBookModal = ({ images, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deviceType = useDeviceType();

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
              bg={{ base: "#fff", md: "#222" }}
              p={4}
              borderRadius="md"
              minH="550px"
            >
              {images && images.length > 0 ? (
                <HTMLFlipBook
                  maxWidth={400}
                  maxHeight={500}
                  height={500}
                  width={400}
                  size={deviceType !== "phone" ? "stretch" : "fixed"}
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
                  {images.map((image, index) => (
                    <div key={index}>
                      <Image src={image} alt={`Page ${index + 1}`} />
                    </div>
                  ))}
                </HTMLFlipBook>
              ) : (
                <Text textAlign="center" color="white">
                  No images found.
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