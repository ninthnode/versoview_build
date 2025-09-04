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
  Spinner,InputGroup, InputRightElement, IconButton
} from "@chakra-ui/react";
import AuthFooter from "../../../AuthFooter";
import { FaRegCheckCircle, FaTimes } from "react-icons/fa";
import { connect } from "react-redux";
import { ResetPasswordRequest } from "@/redux/auth/authActions";
import { FiEye, FiEyeOff } from "react-icons/fi";

function ChangePassword({ params, ResetPasswordRequest }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await ResetPasswordRequest(password, params.id, params.token);
      setIsSubmitted(true);
      setChangeSuccess(res.status === 200);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setChangeSuccess(false);
    } finally {
      setLoading(false);
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
            borderRadius="lg"
            maxW="184px"
            mx="auto"
            mb={8}
            mt={4}
            src={"/assets/logo.svg"}
            alt="Logo"
          />

          {!isSubmitted ? (
            <>
              <Text mb={2} fontWeight="semibold" textAlign="center">
                Set a New Password
              </Text>

              <FormControl id="password" mt={4} isRequired>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

<FormControl id="confirmPassword" mt={4} isRequired>
  <InputGroup>
    <Input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />
    <InputRightElement>
      <IconButton
        variant="ghost"
        size="sm"
        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
      />
    </InputRightElement>
  </InputGroup>
</FormControl>

              {error && (
                <Text color="red.500" mt={2} textAlign="center">
                  {error}
                </Text>
              )}

              <Button
                variant="primary"
                mt={6}
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
              <Flex justify="center" mt={4}>
                {changeSuccess ? (
                  <FaRegCheckCircle color="green" fontSize="5rem" />
                ) : (
                  <FaTimes color="red" fontSize="5rem" />
                )}
              </Flex>
              <Text my={4} fontWeight="medium" textAlign="center">
                {changeSuccess
                  ? "Your password has been successfully updated!"
                  : "Password reset failed. The link may be invalid or expired."}
              </Text>
            </>
          )}

          <Text my={6} textAlign="center">
            Return to{" "}
            <Link color="primary.500" href="/login">
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

const mapDispatchToProps = {
  ResetPasswordRequest,
};

export default connect(null, mapDispatchToProps)(ChangePassword);
