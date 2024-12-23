"use client";
import React from "react";
import {
  Box,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  Flex,
  Divider,
} from "@chakra-ui/react";
import MobileNav from "./MobileNav";
import SidebarContent from "./SidebarContent";
import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationIcon,
  BottomNavigationLabel,
} from "chakra-ui-bottom-navigation";
import SidebarRoutes from "../../routes/SidebarRoutes";
import RightSidebar from "./RightSidebar";
import { useRouter, usePathname } from "next/navigation";
import { RightSidebarRoutes } from "@/routes";
import useDeviceType from "@/components/useDeviceType";

const Navbar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const path = usePathname();
  const router = useRouter();
  const routeIndex = SidebarRoutes.findIndex((route) => route.url === path);
  const [index, setIndex] = React.useState(routeIndex);
  const deviceType = useDeviceType();

  const FullWidthRoutes = ["/publish"];
  const IsFullWidthRoutes = FullWidthRoutes.find((route) =>
    path.startsWith(route)
  )
    ? true
    : false;
  return (
    <Flex
      minH="100vh"
      bg="light"
      w="100%"
      justifyContent={{
        base: !RightSidebarRoutes ? "flex-start" : "center",
        md: "center",
      }}
    >
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Flex
        display="flex"
        flexDir="row"
        overflowY="scroll"
        __css={{
          "&::-webkit-scrollbar": {
            w: "2",
            h: "1",
            display: "none",
          },
          "&::-webkit-scrollbar-track": {
            w: "6",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "10",
            bg: "gray.100",
          },
        }}
        height='100vh'
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          direction="column"
          w="100%"
          zIndex="9999"
          bg="#fff"
          maxW={IsFullWidthRoutes ? "100%" : "3xl"}
        >
          <Box w="100%">
            <Box>
              <Box
                w={{
                  base: "100%",
                  md: IsFullWidthRoutes ? "100%" : "2xl",
                  xl: IsFullWidthRoutes ? "100%" : "3xl",
                }}
                px={4}
                borderRightWidth="2px"
                borderColor="#f5f5f5"
              >
                <MobileNav onOpen={onOpen} />
                <Divider />
                {children}
              </Box>
              <BottomNavigation
                value={index}
                onChange={(newIndex) => {
                  router.push(SidebarRoutes[newIndex].url);
                }}
                colorScheme="white"
                boxShadow="0 -4px 6px rgba(0, 0, 0, 0.1)"
                pt="2"
                style={{ backgroundColor: "#fff" }}
                variant="float"
                // showLabel="if-active"
                showLabel={true}
                display={{ base: "flex", md: "none" }}
                left="0"
                right="0"
                bottom="0"
              >
                {SidebarRoutes.map((route) => (
                  <BottomNavigationItem key={route.name}>
                    <BottomNavigationIcon
                      as={route.icon}
                      fontSize="2xl"
                      fontWeight="bold"
                      color={route.name === "Publish" ? "green.500" : "#333"}
                    />
                    <BottomNavigationLabel fontSize="sm" color="#333">
                      {route.name}
                    </BottomNavigationLabel>
                  </BottomNavigationItem>
                ))}
              </BottomNavigation>
            </Box>
          </Box>
        </Flex>
        {deviceType != "phone" && (
          <Box
            px={4}
            display={{ base: "none", lg: "block" }}
            mt="4.4rem"
            w={IsFullWidthRoutes ? "0" : "xl"}
          >
            <RightSidebar />
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default Navbar;