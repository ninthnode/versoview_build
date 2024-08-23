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
  Text
} from "@chakra-ui/react";
import { FiMoreHorizontal } from 'react-icons/fi';
import { FiShare2 } from "react-icons/fi";

const ShareButton = ({ url, title,shareButton=false,disabled=false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

const sharePost = ()=>{
  if(navigator.share){
    navigator.share({
      title: title,
      text: title,
      url: url
    })
  }else{

    openModal()
  }
}
  return (
    <>
      {shareButton?
        <IconButton
        variant="nostyle"
        aria-label="See menu"
        color="textlight"
        fontSize='25px'
        justifyContent='flex-end'
        icon={<FiShare2/>}
        isDisabled={disabled}
        onClick={sharePost}
        p='0'
      />:
      <Button justifyContent='flex-start' m='0' p='0' variant="nostyle" pl='4' onClick={sharePost} w='100%'>Share</Button>}
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
