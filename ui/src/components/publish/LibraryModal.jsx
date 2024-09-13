import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
const LibraryViewer = dynamic(() => import("@/components/publish/LibraryViewer"), {
    ssr: false,
  });
const LibraryModal = ({ isOpen, onClose,edition,handleLibraryImage }) => {
  return (
    <Modal mx='2' size='6xl' isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize='lg' lineHeight='2.5rem'>Choose Image from Library</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        {edition&&<LibraryViewer file={edition.pdfUrl} handleLibraryImage={handleLibraryImage} onClose={onClose}/>}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
