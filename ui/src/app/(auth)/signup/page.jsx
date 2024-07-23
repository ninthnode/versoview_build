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

function Signup({ signupUser }) {
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
    console.log(formData)
    await signupUser(formData);
  };

  const handleClick = () => {
    setShow(!show);
  };

  return (
    <Box bg="white" w="100%">
      <Flex bg="secondary" p={10} justify="center">
        <Image src={"/assets/desktop-logo.svg"} alt="desktopLogo" />
      </Flex>
      <Flex minH="85vh" align="center" justify="center">
        <Box
          minW={{ base: "380px", lg: "500px" }}
          minH="550px"
          p={{ base: 4, md: 8 }}
          bg="white"
        >
        
          <Flex alignItems="center" mb={4} mt={4}>
            <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
            <Heading size='lg' as="h6" fontWeight="bold" textAlign="left">
              Signup
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
              handleClick={handleClick}
            />
          <Text my={8} textAlign="center">
            <Link color="primary" href="/login">
            Already have an account? Login
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
});

const mapDispatchToProps = {
  signupUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
