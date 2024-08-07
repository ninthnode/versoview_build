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
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import AuthFooter from "../AuthFooter";
import { connect } from "react-redux";
import { ForgotPasswordRequest } from "@/redux/auth/authActions";
import { CiLock } from "react-icons/ci";

const ForgotPassword = ({ ForgotPasswordRequest }) => {
  const { push } = useRouter();
  const [email, setEmail] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await ForgotPasswordRequest(email);
    setIsSend(true);
    setLoading(false);
  };

  return (
    <Box bg="white" mt={4} w="100%" position="relative">
      <Flex minH="85vh" align="center" justify="center">
        <Flex
          flexDirection="column"
          minH="85vh"
          justifyContent="space-between"
          w={{ base: "380px", lg: "380px" }}
          px={{ base: 4, md: 8 }}
          bg="white"
        >
          <Box h="100%" mt={4}>
            <Box>
              <Button bg="secondary" w="fit-content" p="2" borderRadius="20">
                <Image m="0" src={"/assets/back.svg"} mr={2} />
              </Button>

              <Flex alignItems="center" mb={4} mt={8}>
                <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
                <Heading size="lg" as="h6" fontWeight="bold" textAlign="left">
                  Forgot Password
                </Heading>
              </Flex>
              <Text mb={8} w="80%" color="textlight">
                Enter your registered email to receive reset link for your
                password
              </Text>
            </Box>
            {!isSend ? (
              <>
              <Text>Email</Text>
                <FormControl id="email" mt={4} isRequired>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </FormControl>
                <Box position="fixed" bottom="2%" left="0" right="0" w="100%">
                  <Flex justifyContent="center">
                    <Button
                      w="380px"
                      variant="primary"
                      mt={4}
                      onClick={handleSubmit}
                    >


                      <Flex justify={"flex-start"} w="90%" gap={6}>
                        {loading ? <Spinner size="sm" color="white" /> : ""}
                        <CiLock color="#fff" fontSize="22px" />
                        <Box w="70%" textAlign='center'>
                        <Text fontWeight={"light"}>Reset Password</Text>
                        </Box>
                      </Flex>
                    </Button>
                    
                  </Flex>

                  <Text my={6} textAlign="center">
                    Return to{" "}
                    <Link color="primary" href="/login">
                      Login
                    </Link>
                  </Text>
                </Box>
              </>
            ) : (
              <Text mb={2} fontWeight="normal" textAlign="center">
                We have sent a recovery link. Please check your email
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  ForgotPasswordRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
