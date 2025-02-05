"use client";

import React from "react";
import {
  Button,
  FormControl,
  Input,
  Flex,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  Box,
  FormHelperText
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CiMail, CiLock } from "react-icons/ci";
import { IoIosLogIn } from "react-icons/io";
import Link from "next/link";
function LoginForm({
  show,
  loading,
  handleSubmit,
  handleChange,
  handleClick,
  errors,
}) {
  return (
    <form onSubmit={handleSubmit} height="100%">
      <Flex flexDir="column" justifyContent="space-between" height="100%" mt={8}>
        <Flex flexDir="column">
          <FormControl id="email" isRequired>
            <Flex alignItems="center" gap={2}>
              <CiMail fontSize="20px" />
              <Text>Email</Text>
            </Flex>
            <Input
              mt={4}
              type="email"
              placeholder="Enter your email"
              name="email"
              onChange={handleChange}
              isInvalid={errors?.email&&errors.email}
            />
            {errors?.email &&<FormHelperText color='red.500'>
              {errors.email}
            </FormHelperText>}
          </FormControl>
          <FormControl id="password" isRequired mt={4}>
            <Flex alignItems="center" gap={2}>
              <CiLock fontSize="20px" />
              <Text>Password</Text>
            </Flex>
            <InputGroup size="md" mt={4}>
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                name="password"
                onChange={handleChange}
                isInvalid={errors?.password&&errors.password}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? <FaEye /> : <FaEyeSlash />}
                </Button>
              </InputRightElement>
            </InputGroup>
            
            {errors?.password &&<FormHelperText color='red.500'>
              {errors.password}
            </FormHelperText>}
          </FormControl>
          <Flex justify="right" mt={4}>
            <Link color="primary" href="/forgot-password">
              Forgot Password?
            </Link>
          </Flex>
        </Flex>
        <Box w="100%">
          <Flex justifyContent="center">
            <Button
              w="380px"
              textAlign="center"
              variant="primary"
              mt={8}
              type="submit"
            >
              <Flex justify={"flex-start"} w="90%" gap={6}>
                {loading ? <Spinner size="sm" color="white" /> : ""}
                <IoIosLogIn color="#fff" fontSize="22px" />
                <Box w="70%" textAlign='center'>
                <Text fontWeight={"light"}>Log In</Text>
                </Box>
              </Flex>
            </Button>
          </Flex>
        </Box>
      </Flex>
    </form>
  );
}

export default LoginForm;
