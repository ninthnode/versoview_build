import React from "react";
import {
    Box,
    Button,
  } from "@chakra-ui/react";
  import { FaFacebook,FaGoogle,FaApple } from "react-icons/fa";
function LoginBtns() {
  return (
    <Box>
      <Button mt={8} w="100%" leftIcon={<FaFacebook />} variant="outline">
        Facebook
      </Button>
      <Button mt={8} w="100%" leftIcon={<FaGoogle />} variant="outline">
        Google
      </Button>
      <Button mt={8} w="100%" leftIcon={<FaApple />} variant="outline">
        Apple
      </Button>
    </Box>
  );
}

export default LoginBtns;
