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
  Divider
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown, FiSearch } from "react-icons/fi";
import { useSelector,useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginOut } from '@/redux/auth/authActions';

const MobileNav = ({ onOpen, routeName, ...rest }) => {
  const user = useSelector(state => state.auth.user);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const LogoutHandler =()=>{
    dispatch(loginOut());
  }
  return (
    <Flex
      ml={{ base: 0, md: "16rem" }}
      mr={{ base: 0, md: 5 }}
      mt={{ base: 0, md: 3 }}
      px={{ base: 4, md: 4 }}
      height="4rem"
      alignItems="center"
      bg="#fff"
      {...rest}
    >
    <Flex alignItems="center">
        <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
        <Heading as="h6" size="lg" fontWeight="bold" textAlign="left">
          {routeName}
        </Heading>
      </Flex>
    </Flex>
  );
};

export default MobileNav;
