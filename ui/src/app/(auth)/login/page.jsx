"use client";
import React, { useState, useEffect } from "react";
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
import { loginUser } from "@/redux/auth/authActions";
import { connect } from "react-redux";
import LoginBtns from "./LoginBtns";
import LoginForm from "./LoginForm";

function Login({ loginUser, error }) {
  const [backendError, setBackendError] = useState(null);
  const [show, setShow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setBackendError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginUser(formData);
  };

  const handleClick = () => {
    setShow(!show);
  };

  const handleShowForm = () => {
    setShowForm(!showForm);
  };

  useEffect(() => {
    setBackendError(error);
  }, [error]);

  return (
    <Box bg="white" mt={4} w="100%" position="relative" m='0' p='0'>
        <Box
          flexDirection="column"
          h="90vh"
          justifyContent="space-between"
          w={{ base: "320px", lg: "380px" }}
          margin='0 auto'
          // px={{ base: 4, md: 8 }}
          bg="white"
        >
          <Box h="100%" mt='70px'>
            <Box>
              <Flex alignItems="center" mb={2} mt={4}>
                <Image src={"/assets/logo.svg"} alt="logo" mr={2} h="1.6rem" />
                <Heading
                  fontSize="lg"
                  as="h4"
                  fontWeight="bold"
                  textAlign="left"
                >
                  {showForm ? "Login with Email" : "Login"}
                </Heading>
              </Flex>
              <Text mb={8} w="80%" color="textlight">
                Login to start uploading content, discovering communities and
                more...
              </Text>
            </Box>
            <LoginBtns />

            <Flex
              justifyContent="center"
              alignItems="center"
              mt={8}
              mb={4}
              gap={2}
            >
              <Divider />
              Or
              <Divider />
            </Flex>
            <LoginForm
              loading={false}
              show={show}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              handleClick={handleClick}
              errors={backendError}
            />
            <Text textAlign="center" mt={4}>
              <Link href="/signup">Dont have account? SignUp</Link>
            </Text>
          </Box>
        </Box>
    </Box>
  );
}

const mapStateToProps = (state) => ({
  loading: state.auth.loading,
  error: state.auth.error,
});

const mapDispatchToProps = {
  loginUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
