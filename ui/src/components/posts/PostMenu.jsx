import React from "react";
import { Menu, MenuButton,MenuList,Button,IconButton } from "@chakra-ui/react";
import { FiMoreHorizontal } from "react-icons/fi";
import ShareButton from "./ShareButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
const ShareMenu = ({ disabled = false, url, title }) => {

  return (
    <Menu closeOnSelect={false}>
    <MenuButton p='0' as={Button} variant="nostyle" isDisabled={disabled}> 
      <IconButton
        variant="nostyle"
        aria-label="See menu"
        color="textlight"
        fontSize='25px'
        justifyContent='flex-end'
        icon={<FiMoreHorizontal/>}
        disabled={disabled}
        p='0'
      />
      </MenuButton>
      <MenuList minW='8rem' maxW='10rem'>
          <ShareButton url={url} title={title} disabled={disabled}/>
          <CopyToClipboardButton textToCopy={url}/>
      </MenuList>
    </Menu>
  );
};

export default ShareMenu;
