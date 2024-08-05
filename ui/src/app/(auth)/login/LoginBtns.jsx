import React from "react";
import { Box, Button, Flex,Text } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
function LoginBtns() {
  return (
    <Box>
      <Button
        w="100%"
        height="50px"
        borderRadius="md"
        bg="lightgray"
        variant="ghost"
      >
        <Flex justify={"flex-start"} w="90%" gap={6}>
          <FaFacebookF color="#3b5998" fontSize="22px" />
          <Text fontWeight={"light"}>Login with Facebook</Text>
        </Flex>
      </Button>
      <Button
      mt={4}
        w="100%"
        height="50px"
        borderRadius="md"
        bg="lightgray"
        variant="ghost"
      >
        <Flex justify={"flex-start"} w="90%" gap={6}>
          <FcGoogle fontSize="22px"/>
          <Text fontWeight={"light"}>Login with Google</Text>
        </Flex>
      </Button>
      <Button
      mt={4}
        w="100%"
        height="50px"
        borderRadius="md"
        bg="lightgray"
        variant="ghost"
      >
        <Flex justify={"flex-start"} w="90%" gap={6}>
          <FaApple color="#656565dd" fontSize="22px"/>
          <Text fontWeight={"light"}>Login with Apple</Text>
        </Flex>
      </Button>
    </Box>
  );
}

export default LoginBtns;
