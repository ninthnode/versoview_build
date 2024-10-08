import { border } from "@chakra-ui/react";

export const ButtonStyles = {
  baseStyle: {},
  sizes: {},
  variants: {
    primary: (props) => ({
      bg: "primary",
      color: "white",
      fontWeight: "normal",
      _hover: {
        bg: "primary",
      },
    }),
    secondary: (props) => ({
      bg: "secondary",
      color: "white",
      _hover: {
        bg: "secondary",
      },
    }),
    outline: (props) => ({
      bg: "#ECEEFF",
      border:"3px solid",
      borderColor:'primary',
      color: "primary",
      fontWeight: "normal",
      _hover: {
        bg: "primary",
        color: "#fff",
      },
    }),
    dotted: (props) => ({
      bg: "#ECEEFF",
      border:"3px dotted",
      borderColor:'primary',
      color: "primary",
      fontWeight: "normal",
      _hover: {
        bg: "primary",
        color: "#fff",
      },
    }),
    nostyle: (props) => ({
      bg: "#fff",
      color: "#333",
      fontWeight: "normal"
    }),
  },
  // default values for size and variant
  defaultProps: {},
};
