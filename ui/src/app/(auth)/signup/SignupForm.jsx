"use client";

import React, { useState } from "react";
import {
  Button,
  FormControl,
  Input,
  Box,
  Link,
  Text,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import * as v from "valibot";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import { IoIosLogIn } from "react-icons/io";

const emailSchema = v.pipe(v.string(), v.email("must be a valid email"));
const passwordSchema = v.pipe(
  v.string(),
  v.regex(/[A-Z]+/, "must contain upper case characters"),
  v.regex(/[a-z]+/, "must contain lowercase letter"),
  v.regex(/[\$|\.|#|%|&|@|-]+/, "Must contain a symbol")
);

function SignupForm({ loading, handleSubmit, handleChange, backendError }) {
  const [errors, setErrors] = useState({ email: false, password: false });

  const handleEmailInput = (e) => {
    const email = e.target.value;
    // const isValid =
    const parsed = v.safeParse(emailSchema, email);
    if (!parsed.success) {
      setErrors((prev) => ({ ...prev, email: "Must be a valid email" }));
    } else setErrors((s) => ({ ...s, email: false }));
  };
  const handlePasswordInput = (e) => {
    const password = e.target.value;
    // const isValid =
    const parsed = v.safeParse(passwordSchema, password);
    if (!parsed.success) {
      setErrors((prev) => ({
        ...prev,
        password: parsed.issues.map((i) => i.message).join(", "),
      }));
    } else setErrors((s) => ({ ...s, password: false }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
      {backendError && (
        <small className="text-xs font-thin text-red-500">{backendError}</small>
      )}
      <FormControl id="first_name" isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiUser fontSize="20px" />
          <Text>Channel Name</Text>
        </Flex>
        <Input
          type="text"
          placeholder="Khalid Saeed"
          name="channelName"
          onChange={handleChange}
          // isInvalid={errors.channelName}
        />
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
          onChange={handleChange}
        />
      </FormControl>
      <FormControl id="email" mt={4} isRequired>
        <Flex alignItems="center" gap={2} mb="2">
          <CiMail fontSize="20px" />
          <Text>Email</Text>
        </Flex>
        <Input
          type="email"
          placeholder="Email"
          name="email"
          onChange={handleChange}
          onInput={handleEmailInput}
          isInvalid={errors.email}
        />
        {errors.email && (
          <small className="text-xs font-thin text-red-500">
            {errors.email}
          </small>
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
          onInput={handlePasswordInput}
          isInvalid={errors.password}
        />
        {errors.password && (
          <small className="text-xs font-thin text-red-500">
            {errors.password}
          </small>
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
            disabled={errors.password || errors.email}
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
