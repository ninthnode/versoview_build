"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  Divider,
  Input,
  Text,
  Flex,
  Image,
  Link,
  Spinner,
} from "@chakra-ui/react";
import AuthFooter from "../../../AuthFooter";
import { FaRegCheckCircle, FaTimes } from "react-icons/fa";
import { connect } from "react-redux";
import { ResetPasswordRequest } from "@/redux/auth/authActions";

function ChangePassword({ params, ResetPasswordRequest }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const res = await ResetPasswordRequest(
      password,
      params.passkey,
      params.hashkey
    );
    setLoading(false);
    setIsSubmitted(true);
    if (res.success) {
      setChangeSuccess(true);
    }
  };

  return (
    <Box bg="secondary" w="100%">
      <Flex minH="100vh" align="center" justify="center">
        <Box
          minW={{ base: "380px", lg: "500px" }}
          minH="450px"
          p={{ base: 4, md: 8 }}
          borderWidth="1px"
          borderRadius="5px"
          bg="white"
        >
          <Image
            src={"/victo.png"}
            alt="victo logo"
            borderRadius="lg"
            maxW="184px"
            mx="auto"
            mb={8}
            mt={4}
          />
          {!isSubmitted ? (
            <>
              <Text mb={2} fontWeight="normal" textAlign="center">
                Enter New Password
              </Text>
              <FormControl id="password" mt={4} isRequired>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl id="confirmPassword" mt={4} isRequired>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>
              {error && (
                <Text color="red" mt={2} textAlign="center">
                  {error}
                </Text>
              )}
              <Button
                variant="primary"
                mt={4}
                w="100%"
                onClick={handleSubmit}
                isDisabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  "Change Password"
                )}
              </Button>
            </>
          ) : (
            <>
              {changeSuccess ? (
                <>
                  <Flex justify="center">
                    <FaRegCheckCircle color="green" fontSize="6rem" />
                  </Flex>
                  <Text my={4} fontWeight="normal" textAlign="center">
                    Password Changed Successfully!
                  </Text>
                </>
              ) : (
                <>
                  <Flex justify="center">
                    <FaTimes color="Red" fontSize="6rem" />
                  </Flex>
                  <Text my={4} fontWeight="normal" textAlign="center">
                    Password Not Changed! <br />
                    Error: Invalid Request!
                  </Text>
                </>
              )}
            </>
          )}

          <Text my={6} textAlign="center">
            Return to{" "}
            <Link color="primary" href="/login">
              Login
            </Link>
          </Text>
          <Divider my={4} />
          <AuthFooter />
        </Box>
      </Flex>
    </Box>
  );
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  ResetPasswordRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
