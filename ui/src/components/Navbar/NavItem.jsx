import React from "react";
import { Flex, Icon,Tag,Box,Text } from "@chakra-ui/react";
import Link from "next/link";

const NavItem = ({ icon,link, children,isActive,url, ...rest }) => {
  return (
    <Link href={url} style={{ textDecoration: "none" }} >
      <Box
        align="center"
        justify="space-between"
        p="3"
        mx="4"
        borderRadius="lg"
        role="group"
        bg={'transparent'}
        color={'#333'}
        {...rest}
      >
      <Flex flexDirection='column' justify='center' textAlign='center'>
        {icon && (
          <Icon
            mr="4"
            w='100%'
            fontSize="25"
            as={icon}
            color='green'
          />
        )}
        <Text mt='2'>{children}</Text>
        </Flex>
      </Box>
    </Link>
  );
};

export default NavItem;
