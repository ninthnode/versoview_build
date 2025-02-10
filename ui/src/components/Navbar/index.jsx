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
      // w={IsFullWidthRoutes ? "100%" : "90%"}
      w='100%'
      bg="light"
      margin='0 auto'
      pos='relative'
      justifyContent={{
        base: !RightSidebarRoutes ? "flex-start" : "center",
        md: "center",
      }}
      
          alignItems='stretch'
    >
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
        <Flex
          alignItems="center"
          justifyContent="space-between"
          direction="column"
          bg="#fff"
          w={IsFullWidthRoutes ? "100%" :{ base: "xl",md: "xl", lg: "3xl" }}
          overflowX='hidden'
          pos='relative'
          minH='100%'
        >
          <Box w="100%" minH={'100vh'} mb='100px'>
            <Box>
              <Box
                w={{
                  base: "100%",
                }}
                px={4}
                borderRightWidth="2px"
                borderColor="#f5f5f5"
                minH={!RightSidebarRoutes?'150vh':""}
                id="main_container"
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
            display={IsFullWidthRoutes ? "none" : { base: "none", lg: "block" }}
            mt="4.4rem"
            w={ { base: "xs", lg: "md" }}
            pos='relative'
            id="sidebar"
          >
            <RightSidebar />
          </Box>
        )}
    </Flex>
  );
};

export default Navbar;