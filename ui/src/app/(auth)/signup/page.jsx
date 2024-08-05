"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Text,
  Flex,
  Image,
  Link,
  Heading,
} from "@chakra-ui/react";
import { signupUser } from "@/redux/auth/authActions";
import { connect } from "react-redux";
import SignupForm from "./SignupForm";

function Signup({ signupUser,error }) {
  const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    channelName:"",
    username:"",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signupUser(formData);
  };

  return (
    <Box bg="white" w="100%">
      <Flex align="center" justify="center">
        <Box
          minW={{ base: "380px", lg: "380px" }}
          minH="700px"
          p={{ base: 4, md: 8 }}
          bg="white"
        >
        
          <Flex alignItems="center" mb={4} mt={4}>
            <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
            <Heading size='lg' as="h6" fontWeight="bold" textAlign="left">
              Create Account
            </Heading>
          </Flex>
          <Text mb={8} w="80%">
            Signup to start uploading content, discovering communities and
            more...
          </Text>
            <SignupForm
              loading={false}
              show={show}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              backendError={error}
            />
         
        </Box>
      </Flex>
    </Box>
  );
}

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  error: state.auth.error,
});

const mapDispatchToProps = {
  signupUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
