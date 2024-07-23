"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  Divider,
  Input,
  Text,
  Flex,
  Image,
  Link,
  Spinner
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import AuthFooter from "../AuthFooter";
import { connect } from "react-redux";
import { ForgotPasswordRequest } from "@/redux/auth/authActions";

const ForgotPassword = ({ ForgotPasswordRequest }) => {
  const { push } = useRouter();
  const [email, setEmail] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    await ForgotPasswordRequest(email);
    setIsSend(true);
    setLoading(false)
  };

  return (
    <Box bg="secondary" w="100%">
      <Flex minH="100vh" align="center" justify="center">
        <Box
          minW={{ base: "380px", lg: "500px" }}
          minH="350px"
          p={{ base: 4, md: 8 }}
          borderWidth="1px"
          borderRadius="5px"
          bg="white"
        >
          <Image
            src={"/victo.png"}
            alt="victo logo"
            borderRadius="lg"
            maxW="184px"
            mx="auto"
            mb={8}
            mt={4}
          />
          {!isSend ? (
            <>
              <Text mb={2} fontWeight="normal" textAlign="center">
                Can’t log in?
              </Text>
              <Text mb={2} fontWeight="normal" textAlign="center">
                We’ll send a recovery link to email
              </Text>
              <FormControl id="email" mt={4} isRequired>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </FormControl>
              <Button variant="primary" mt={4} w="100%" onClick={handleSubmit}>
                {loading?<Spinner size="sm" color="white" />:"Send recovery link"}
              </Button>
            </>
          ) : (
            <Text mb={2} fontWeight="normal" textAlign="center">
              We have sent a recovery link. Please check your email
            </Text>
          )}
          <Text my={6} textAlign="center">
            Return to{" "}
            <Link color="primary" href="/login">
              Login
            </Link>
          </Text>
          <Divider my={4} />
          <AuthFooter />
        </Box>
      </Flex>
    </Box>
  );
};

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  ForgotPasswordRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
