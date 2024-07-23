import React from "react";
import {
  Button,
  FormControl,
  Input,
  Box,
  Link,
  Text,
  Spinner,Flex
} from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";

function SignupForm({
  show,
  loading,
  handleSubmit,
  handleChange,
  handleClick,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <FormControl id="first_name" isRequired>
      <Flex><label> Channel Name</label></Flex>
      <Input
          type="text"
          placeholder="Khalid Saied"
          name="channelName"
          onChange={handleChange}
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
        />
      </FormControl>
      <FormControl id="password" mt={4} isRequired>
      <label>Password</label>
        <Input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
        />
      </FormControl>
      <Box justify="center" mt={4}>
        <Text fontWeight="normal" color="text">
          By signing up you agree with our
          <Link color="primary" mx={1} target="_blank">
            Terms of Services
          </Link>
        </Text>
      </Box>
      <Button variant="primary" mt={4} w="100%" type="submit">
        {loading ? <Spinner size="sm" color="white" /> : ""} Sign up
      </Button>
    </form>
  );
}

export default SignupForm;
