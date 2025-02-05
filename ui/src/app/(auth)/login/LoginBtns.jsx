import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "@/redux/auth/authActions";
import { useDispatch } from "react-redux";
import CustomGoogleButton from "@/components/auth/CustomGoogleButton";

function LoginBtns() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const dispatch = useDispatch();
  const handleGoogleFailure = (error) => {
    console.error("Google OAuth Failure:", error);
  };

  return (
    <Box>
      {/* <Button
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
      </Button> */}

      <GoogleOAuthProvider clientId={clientId}>
        <CustomGoogleButton />
      </GoogleOAuthProvider>
      {/* <Button
        mt={4}
        w="100%"
        height="50px"
        borderRadius="md"
        bg="lightgray"
        variant="ghost"
      >
        <Flex justify={"flex-start"} w="90%" gap={6}>
          <FaApple color="#656565dd" fontSize="22px" />
          <Text fontWeight={"light"}>Login with Apple</Text>
        </Flex>
      </Button> */}
    </Box>
  );
}

export default LoginBtns;
