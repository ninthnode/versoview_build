import React from "react";
import { connect } from "react-redux";
import { usePathname } from "next/navigation";
import { RoutesList } from "@/routes/index";
import {
  Flex,
  Box,
  Text,
  Image,
  Button,
  Heading,
  Avatar,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {getExcerptText} from "@/app/utils/GetExcerpt";
import useDeviceType from "@/components/useDeviceType";

const NavbarTitle = ({ navtitle, navicon }) => {
  const pathname = usePathname();
  const router = useRouter();
  const deviceType = useDeviceType();

  const getRouteName = (path) => {
    for (const route of RoutesList) {
      if(!route.showTitle) return null;
      if (route.url === path || path.startsWith(route.url)) {
        return route.name;
      }
    }
  };
  return (
    <nav>
      {getRouteName(pathname) ? (
        <Flex alignItems='center' px={4}>
          <Image src={"/assets/logo.svg"} alt="logo" mr={2} h='1.6rem'/>
          <Heading as="h5" fontSize="xl" fontWeight='extrabold'>
           {getRouteName(pathname)}
          </Heading>
        </Flex>
      ) : (
        <Flex alignItems="center" mb={2} px={4}>
          <Button ml='-10px' pr='2' pl="0" variant="ghost" onClick={() => router.back()}>
            <Image m="0" src={"/assets/back.svg"} />
          </Button>
          {/* {!pathname.startsWith("/post") ||!pathname.startsWith("/messages") && (
            <>
              {navicon && (
                <Avatar
                  size="md"
                  borderRadius={10}
                  src={navicon}
                />
              )}
              {navtitle&&<Heading ml={2} as="h5" fontSize="22px" w={{base:'215px',sm:'100%'}}>
              <Tooltip label={navtitle} aria-label='A tooltip'>
              {deviceType=='phone'?getExcerptText(navtitle, 35):navtitle}
              </Tooltip>
              </Heading>}
            </>
          )} */}
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
