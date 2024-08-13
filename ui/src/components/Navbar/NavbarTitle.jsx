import React from "react";
import { connect } from "react-redux";
import { usePathname } from "next/navigation";
import { RoutesList } from "@/routes/index";
import { Flex, Box, Text, Image,Button,Heading,Avatar } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const NavbarTitle = ({ navtitle,navicon }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getRouteName = (path) => {
    for (const route of RoutesList) {
      // Check If Includes Path In Routes
      // if (route.url === path || path.startsWith(route.url)) {
      //   return route.name;
      // }
      if (route.url === path) {
        return route.name;
      }
    }
    return null;
  };
  return (
    <nav>
      {getRouteName(pathname) ? (
        <Flex>
          <Image src={"/assets/logo.svg"} alt="logo" mr={2} />
          <Heading as='h5' fontSize='25px'>{getRouteName(pathname)}</Heading>
        </Flex>
      ) : (
        <Flex alignItems="center" mb={2}>
          <Button pl="0" variant="ghost" onClick={() => router.back()}>
            <Image m="0" src={"/assets/back.svg"}/>
          </Button>
            <Avatar
              size="md"
              borderRadius={10}
              name={"test"}
              src={navicon}
            />
            <Heading ml={2} as='h5' fontSize='23px'>{navtitle}</Heading>
        </Flex>
      )}
    </nav>
  );
};

const mapStateToProps = (state) => ({
  navtitle: state.navtitle.title,
  navicon: state.navtitle.icon,
});

export default connect(mapStateToProps)(NavbarTitle);
