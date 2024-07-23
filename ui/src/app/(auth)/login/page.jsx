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
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope } from "react-icons/fa";
import { loginUser, googleLogin } from "@/redux/auth/authActions";
import { connect } from "react-redux";
import LoginBtns from "./LoginBtns";
import LoginForm from "./LoginForm";

function Login({ loginUser }) {
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
          {showForm && (
            <>
            <Button
              bg="secondary"
              w="fit-content"
              p="2"
              borderRadius="20"
              onClick={handleShowForm}
            >
              <Image m="0" src={"/assets/back.svg"} mr={2} />
            </Button></>
          )}
          <Flex alignItems="center" mb={4} mt={4}>
            <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
            <Heading size='lg' as="h6" fontWeight="bold" textAlign="left">
              Login
            </Heading>
          </Flex>
          <Text mb={8} w="80%">
            Login to start uploading content, discovering communities and
            more...
          </Text>
          {showForm ? (
            <LoginForm
              loading={false}
              show={show}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              handleClick={handleClick}
            />
          ) : (
            <LoginBtns />
          )}
          {!showForm && (
            <>
              <Flex align="center" mt={6}>
                <Divider flex={2} />
                <Text mx={2} fontWeight="normal" color="text">
                  Or continue with
                </Text>
                <Divider flex={2} />
              </Flex>
              <Flex justify="center" mt="4" w="100%">
                <Button
                  mt={8}
                  w="100%"
                  leftIcon={<FaEnvelope />}
                  variant="outline"
                  onClick={handleShowForm}
                >
                  Login With Email
                </Button>
              </Flex>
            </>
          )}
          <Text my={8} textAlign="center">
            <Link color="primary" href="/signup">
              Don't have account? SignUp
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
  loginUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
