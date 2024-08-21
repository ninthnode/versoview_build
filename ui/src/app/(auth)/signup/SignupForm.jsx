"use client";

import React, { useState,useEffect } from "react";
import {
  Button,
  FormControl,
  Input,
  Box,
  Link,
  Text,
  Spinner,
  Flex,
  FormHelperText
} from "@chakra-ui/react";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import { IoIosLogIn } from "react-icons/io";

function SignupForm({ loading, handleSubmit, handleChange, backendError }) {
    const [groupedErrors, setGroupedErrors] = useState(null)
    useEffect(() => {
      if(backendError){
        if(backendError.type){
          let newObj = {}
          newObj[backendError.type] = {
            text: backendError.text
          };
          setGroupedErrors(newObj)
          return
        }
      const temerr = backendError.reduce((acc, error) => {
        if (!acc[error.type]) {
          acc[error.type] = {
            text: error.text
          };
        } else {
          acc[error.type].text += `, ${error.text}`;
        }
        return acc;
      }, {});
      setGroupedErrors(temerr)
      } 
      else
      setGroupedErrors(null)
    }, [backendError])
    
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
      <FormControl id="first_name" isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiUser fontSize="20px" />
          <Text>Channel Name</Text>
        </Flex>
        <Input
          type="text"
          placeholder="Khalid Saeed"
          name="channelName"
          maxLength='32'
          onChange={handleChange}
          isInvalid={groupedErrors?.channelName&&groupedErrors.channelName}
        />
        {groupedErrors?.channelName && (
          <FormHelperText color='red.500'>
            {groupedErrors.channelName.text}
          </FormHelperText>
        )}
      </FormControl>
      <FormControl id="last_name" mt={4} isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiUser fontSize="20px" />
          <Text>@User name; ie: @KhaidS</Text>
        </Flex>
        <Input
          type="text"
          placeholder="UserName"
          name="username"
          maxLength='15'
          onChange={handleChange}
          isInvalid={groupedErrors?.username&&groupedErrors.username}
        />
        {groupedErrors?.username && (
          <FormHelperText color='red.500'>
            {groupedErrors.username.text}
          </FormHelperText>
        )}
      </FormControl>
      <FormControl id="email" mt={4} isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiMail fontSize="20px" />
          <Text>Email</Text>
        </Flex>
        <Input
          // type="email"
          placeholder="Email"
          name="email"
          onChange={handleChange}
          isInvalid={groupedErrors?.email&&groupedErrors.email}
        />
        {groupedErrors?.email && (
          <FormHelperText color='red.500'>
            {groupedErrors.email.text}
          </FormHelperText>
        )}
      </FormControl>
      <FormControl id="password" mt={4} isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiLock fontSize="20px" />
          <Text>Password</Text>
        </Flex>
        <Input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          isInvalid={groupedErrors?.password&&groupedErrors.password}
        />
        {groupedErrors?.password && (
          <FormHelperText color='red.500'>
            {groupedErrors.password.text}
          </FormHelperText>
        )}
      </FormControl>

      <Box position="fixed" bottom="2%" left="0" right="0" w="100%" bg='#fff'>
        <Box textAlign="center" justify="center">
          <Text fontWeight="normal" color="text">
            By signing up you agree with our
            <Link mx={1} target="_blank">
              Terms of Conditions
            </Link>
          </Text>
        </Box>
        <Text textAlign="center">
          <Link href="/login">
            Already have an account? Login
          </Link>
        </Text>
        <Flex justifyContent="center">
          <Button
            w="380px"
            textAlign="center"
            variant="primary"
            m={2}
            type="submit"
            // disabled={errors.password || errors.email}
          >
            <Flex justify={"flex-start"} w="90%" gap={6}>
            {loading ? <Spinner size="sm" color="white" /> : ""}
                <IoIosLogIn color="#fff" fontSize="22px" />
                <Box w="70%" textAlign='center'>
                <Text fontWeight={"light"}>Sign up</Text>
                </Box>
              </Flex>
          </Button>
        </Flex>
      </Box>
    </form>
  );
}

export default SignupForm;
