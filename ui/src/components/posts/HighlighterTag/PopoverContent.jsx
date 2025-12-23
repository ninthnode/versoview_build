import React from "react";
import { FaCommentAlt } from "react-icons/fa";
import { Flex } from "@chakra-ui/react";
const PopoverContent = ({ onClick }) => {
  return (
    <Flex
      justifyContent="center"
      padding="10px"
      h="30px"
      w="100px"
      borderRadius="10px"
      alignItems="center"
      backgroundColor="#333"
      color="#fff"
      cursor="pointer"
      margin="0 auto"
      onClick={onClick}
      gap={2}
    >
      <FaCommentAlt fontSize="11px"/>Comment
    </Flex>
  );
};

export default PopoverContent;
