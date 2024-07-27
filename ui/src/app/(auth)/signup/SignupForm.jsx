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
        <Flex>
          <label>Channel Name</label>
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
        <label>@User name; ie: @KhaidS</label>
        <Input
          type="text"
          placeholder="UserName"
          name="username"
          onChange={handleChange}
        />
      </FormControl>
      <FormControl id="email" mt={4} isRequired>
        <label>Email</label>
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
        <label>Password</label>
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
      <Box justify="center" mt={4}>
        <Text fontWeight="normal" color="text">
          By signing up you agree with our
          <Link color="primary" mx={1} target="_blank">
            Terms of Services
          </Link>
        </Text>
      </Box>
      <Button
        variant="primary"
        mt={4}
        w="100%"
        type="submit"
        disabled={
          // errors.username ||
          errors.password || errors.email
          // ||          errors.channelName
        }
      >
        {loading ? <Spinner size="sm" color="white" /> : ""} Sign up
      </Button>
    </form>
  );
}

export default SignupForm;
