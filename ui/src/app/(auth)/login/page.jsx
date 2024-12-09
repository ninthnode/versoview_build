"use client";
import React, { useState,useEffect } from "react";
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
    setBackendError(null)
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
    setBackendError(error)
  }, [error])

 

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
                  </Button>
                </>
              )}
              <Flex alignItems="center" mb={2} mt={4}>
                <Image src={"/assets/logo.svg"} alt="logo" mr={2} h='1.6rem'/>
                <Heading fontSize="lg" as="h4" fontWeight="bold" textAlign="left">
                  {showForm?"Login with Email":"Login"}
                </Heading>
              </Flex>
              <Text mb={8} w="80%" color="textlight">
                Login to start uploading content, discovering communities and
                more...
              </Text>
            </Box>
            {showForm ? (
              <LoginForm
                loading={false}
                show={show}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                handleClick={handleClick}
                errors={backendError}
              />
            ) : (
              <LoginBtns />
            )}
          </Box>

          <Box position="fixed" bottom="10%" left="0" right="0" w="100%">
            <Flex justifyContent="center">
              {!showForm && (
                <>
                  <Flex justify="center" w="380px" px={{ base: 4, md: 8 }}>
                    <Button mt={4} w="100%" onClick={handleShowForm}>
                      <Flex
                        justify={"flex-start"}
                        alignItems="center"
                        w="90%"
                        gap={6}
                        height="15px"
                      >
                        <img
                          src="assets/envelope.png"
                          width="18px"
                          height="2px"
                        />
                        <Text fontWeight={"light"}>Login With Email</Text>
                      </Flex>
                    </Button>
                  </Flex>
                </>
              )}
            </Flex>
            <Text textAlign="center" mt={8}>
              <Link href="/signup">Dont have account? SignUp</Link>
            </Text>
          </Box>
        </Flex>
      </Flex>
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
