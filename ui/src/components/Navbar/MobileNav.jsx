import React from "react";
import {
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  Avatar,
  VStack,
  Box,
  HStack,
  useColorModeValue,
  MenuList,
  MenuItem,
  MenuDivider,
  Image,
  Heading,
  Button,
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown, FiSearch } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { loginOut } from "@/redux/auth/authActions";
import NavbarTitle from "./NavbarTitle";

const MobileNav = ({ onOpen, ...rest }) => {
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const LogoutHandler = () => {
    dispatch(loginOut());
  };
  return (
    <Flex
      ml={{ base: 0, md: "16rem" }}
      mr={{ base: 0, md: 5 }}
      mt={{ base: 4 }}
      px={{ base: 4, md: 4 }}
      height="3rem"
      alignItems="center"
      bg="#fff"
      {...rest}
    >
      <Flex alignItems="center" p="0">
        <Heading
          fontSize="3xl"
          as="h3"
          size="lg"
          fontWeight="bold"
          textAlign="left"
          p={0}
        >
          <NavbarTitle/>
        </Heading>
      </Flex>
    </Flex>
  );
};

export default MobileNav;
