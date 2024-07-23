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
import { usePathname } from 'next/navigation'

const Navbar = ({ routeName, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const path = usePathname();
  const routeIndex = SidebarRoutes.findIndex(route => route.url === path);
  const [index, setIndex] = React.useState(routeIndex);
  
  return (
    <Box minH="100vh" bg="light">
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Flex
        alignItems="center"
        justifyContent="space-between"
        direction="column"
      >
        <Box w="100%">
          <MobileNav onOpen={onOpen} routeName={routeName} />
          <Divider />
          <Box
            ml={{ base: 0, md: "16rem" }}
            mr={{ base: 0, md: 5 }}
            mt={{ base: 4, md: 4 }}
          >
            <Box w={{ base: "100%", lg: "60%", md: "70%", sm: "100%" }}>
              {children}
            </Box>
            <BottomNavigation
                value={index}
                onChange={(newIndex) => {
                  window.location.href=SidebarRoutes[newIndex].url
                }}
                colorScheme="white"
                border="2px solid #e5e5e5"
                py='2'
                style={{backgroundColor:"#fff"}}
                variant="float"
                showLabel="if-active"
                display={{ base: "flex", md: "none" }}
                left='0'
                right='0'
                bottom='0'
                
              >
                {SidebarRoutes.map((route) => (
                  <BottomNavigationItem onClick={()=>window.location.href=route.url}>
                    <BottomNavigationIcon as={route.icon} fontSize='2xl' fontWeight='bold'/>
                    <BottomNavigationLabel fontSize='md' fontWeight='bold'>{route.name}</BottomNavigationLabel>
                  </BottomNavigationItem>
                ))}
              </BottomNavigation>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
