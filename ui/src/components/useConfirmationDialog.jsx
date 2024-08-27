import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

const ConfirmationDialog = ({ isOpen, onClose, text, onConfirm }) => {
  const handleYes = () => {
    onConfirm(true);
    onClose();
  };

  const handleNo = () => {
    onConfirm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Confirmation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{text}</Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleYes}>
            Yes
          </Button>
          <Button variant="ghost" onClick={handleNo}>
            No
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const useConfirmationDialog = (text) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [resolvePromise, setResolvePromise] = useState(null);

  const showDialog = () => {
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
      onOpen();
    });
  };

  const handleConfirm = (result) => {
    if (resolvePromise) {
      resolvePromise(result);
    }
  };

  const ConfirmationDialogComponent = (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      text={text}
      onConfirm={handleConfirm}
    />
  );

  return [showDialog, ConfirmationDialogComponent];
};

export default useConfirmationDialog;
