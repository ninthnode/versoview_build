import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";

function CustomGoogleButton() {
  const gLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => console.log(tokenResponse),
  });
  return (
    <Button
      mt={4}
      w="100%"
      height="50px"
      borderRadius="md"
      bg="lightgray"
      variant="ghost"
      onClick={gLogin}
    >
      <Flex justify={"flex-start"} w="90%" gap={6}>
        <FcGoogle fontSize="22px" />
        <Text fontWeight={"light"}>Login with Google</Text>
      </Flex>
    </Button>
  );
}

export default CustomGoogleButton;
