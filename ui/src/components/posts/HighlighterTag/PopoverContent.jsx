import React from "react";
import { FaPen } from "react-icons/fa";
import { Flex } from "@chakra-ui/react";
const PopoverContent = ({ onClick }) => {
  return (
    <Flex
      justifyContent="center"
      padding="10px"
      h="30px"
      w="30px"
      borderRadius="10px"
      alignItems="center"
      backgroundColor="#333"
      color="#fff"
      cursor="pointer"
      margin="0 auto"
      onClick={onClick}
    >
      <FaPen fontSize="18px" />
    </Flex>
  );
};

export default PopoverContent;
