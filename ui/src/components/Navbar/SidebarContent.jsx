"use client";
import React from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  CloseButton,
  Image,
  Divider,
  Tag,
} from "@chakra-ui/react";
import SidebarRoutes from "../../routes/SidebarRoutes";
import NavItem from "./NavItem";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginOut } from "@/redux/auth/authActions";

const SidebarContent = ({ onClose, ...rest }) => {
  const path = usePathname();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user?.user);

  const isAdmin = user && user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  const LogoutHandler = () => {
    dispatch(loginOut());
  };

  // Filter routes based on admin status
  const filteredRoutes = SidebarRoutes.filter(route => {
    if (route.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <Box
      transition="0.3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: "11rem" }}
      h="full"
      position="sticky"
      top="0"
      {...rest}
    >
      <Box>
        <Flex
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          justifyContent="flex-end"
          h="3rem"
        >
          <CloseButton mx="8" variant="outline" onClick={onClose} />
        </Flex>
        <Flex height="4rem" pt="2rem" justify="center">
          {/* <Image src={"/assets/desktop-logo.svg"} h='20px' alt="desktopLogo" /> */}
        </Flex>
        {/* <Divider flex={2} /> */}
        <Flex
          flexDirection="column"
          height="80vh"
          justifyContent="space-between"
        >
          <Box w="11rem">
            {/* {filteredRoutes.map((link) => console.log(link))} */}
            {filteredRoutes.map((link) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                url={link.url}
                isActive={path === link.url}
                link={link}
                mt="2"
              >
                {link.name}
              </NavItem>
            ))}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default SidebarContent;
