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
import { usePathname } from "next/navigation";

const Navbar = ({ routeName, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const path = usePathname();
  const routeIndex = SidebarRoutes.findIndex((route) => route.url === path);
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
          <Box
            ml={{ base: 0, md: "16rem" }}
            mr={{ base: 0, md: 5 }}
          >
            <Box
              mb={"100px"}
              w={{ base: "100%", lg: "100%", md: "70%", sm: "100%" }}
            >
              <Divider />
              {children}
            </Box>
            <BottomNavigation
              value={index}
              onChange={(newIndex) => {
                window.location.href = SidebarRoutes[newIndex].url;
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
                <BottomNavigationItem
                  key={route.name}
                  onClick={() => (window.location.href = route.url)}
                >
                  <BottomNavigationIcon
                    as={route.icon}
                    fontSize="3xl"
                    fontWeight="bold"
                    color={route.name === "Publish" ? "green" : "#333"}
                  />
                  <BottomNavigationLabel fontSize="xs" color="#333">
                    {route.name}
                  </BottomNavigationLabel>
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
