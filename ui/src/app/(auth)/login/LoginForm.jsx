import React from "react";
import {
  Button,
  FormControl,
  Input,
  Flex,
  Link,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { FaEye,FaEyeSlash } from "react-icons/fa";

function LoginForm({show,loading,handleSubmit,handleChange,handleClick}) {
  return (
    <form onSubmit={handleSubmit}>
      <FormControl id="email" isRequired>
        <Input
          type="email"
          placeholder="Enter your email"
          name="email"
          onChange={handleChange}
        />
      </FormControl>
      <InputGroup size="md" mt={4}>
        <Input
          pr="4.5rem"
          type={show ? "text" : "password"}
          placeholder="Enter password"
          name="password"
          onChange={handleChange}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleClick}>
            {show ? <FaEye /> : <FaEyeSlash />}
          </Button>
        </InputRightElement>
      </InputGroup>
      <Flex justify="right" mt={4}>
        <Link color="primary" href="/forgot-password">
          Forgot Password?
        </Link>
      </Flex>
      <Button variant="primary" mt={4} w="100%" type="submit">
        {loading ? <Spinner size="sm" color="white" /> : ""} Log In
      </Button>
    </form>
  );
}

export default LoginForm;
