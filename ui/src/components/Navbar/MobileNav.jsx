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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginOut } from "@/redux/auth/authActions";

const MobileNav = ({ onOpen, routeName, ...rest }) => {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();

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
          {routeName ? (
            <Flex>
              <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
              {routeName}
            </Flex>
          ) : (
            <Flex alignItems="center" mb={2}>
              <Button variant='ghost' onClick={() => router.back()}>
                <Image m="0" src={"/assets/back.svg"} mr={2} />
              </Button>
            </Flex>
          )}
        </Heading>
      </Flex>
    </Flex>
  );
};

export default MobileNav;
