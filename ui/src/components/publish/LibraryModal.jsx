import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Flex,
} from "@chakra-ui/react";
const LibraryModal = ({ isOpen, onClose, edition, handleLibraryImage }) => {
  return (
    <Modal mx="2" size="6xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg" lineHeight="2.5rem">
          Choose Image from Library
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {edition && edition.libraryImages && (
            <Flex wrap="wrap" justifyContent="space-between" gap={4}>
              {edition.libraryImages.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  boxSize="30%" // Ensure three images fit per row
                  objectFit="cover"
                  onClick={()=>handleLibraryImage(image)}
                />
              ))}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
