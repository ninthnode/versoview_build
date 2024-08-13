import React from "react";
import {
  Flex,
  Box,
  Divider,
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
  return (<>
    <Flex
      mr={{ base: 0, md: 5 }}
      mt={{ base: 4 }}
      px={0}
      height="3rem"
      alignItems="center"
      bg="#fff"
      {...rest}
    >
      <Flex justifyContent='space-between' alignItems="center" p="0" w='100%'>
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
        <Box>
        <Image src={"/assets/group-icon.png"} h='40px' w='40px'/>
        </Box>
      </Flex>
      
    </Flex>
    </>
  );
};

export default MobileNav;
