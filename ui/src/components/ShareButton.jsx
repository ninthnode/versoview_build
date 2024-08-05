import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  RedditShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  RedditIcon,
  WhatsappIcon,
} from "react-share";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
} from "@chakra-ui/react";
import { FiMoreHorizontal } from 'react-icons/fi';

const ShareButton = ({ url, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <IconButton
        variant="ghost"
        color="gray.400"
        aria-label="See menu"
        fontSize='25px'
        icon={<FiMoreHorizontal/>}
        onClick={openModal}
      />
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share this post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FacebookShareButton url={url} quote={title}>
              <FacebookIcon size={32} round="true" />
            </FacebookShareButton>
            <TwitterShareButton url={url} title={title}>
              <TwitterIcon size={32} round="true" />
            </TwitterShareButton>
            <LinkedinShareButton url={url} title={title}>
              <LinkedinIcon size={32} round="true" />
            </LinkedinShareButton>
            <RedditShareButton url={url} title={title}>
              <RedditIcon size={32} round="true" />
            </RedditShareButton>
            <WhatsappShareButton url={url} title={title}>
              <WhatsappIcon size={32} round="true" />
            </WhatsappShareButton>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareButton;
