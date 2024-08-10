import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles as Button } from "./components/ButtonStyles";
import { TagStyles as Tag } from "./components/TagStyles";
import BottomNavigationStyles from "./components/BottomNavigation";

const customTheme = extendTheme({
  fonts: {
    body: "SF-Pro-Display-Medium, sans-serif",
    heading: "SF-Pro-Display-Bold, sans-serif",
    button: "SF-Pro-Display-Bold",
    p: "SF-Pro-Display-Medium",
    span: "SF-Pro-Display-Medium, sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
    "4xl": "3rem",
    "5xl": "4rem",
    "6xl": "5rem",
  },
  fontWeights: {
    normal: 300,
  },
  styles: {
    global: {
      "@font-face": [
        {
          fontFamily: "SF-Pro-Display-Regular",
          src: 'url(/fonts/SF-Pro-Display-Regular.otf) format("opentype")',
          fontWeight: "normal",
          fontStyle: "normal",
        },
        {
          fontFamily: "SF-Pro-Display-Bold",
          src: 'url(/fonts/SF-Pro-Display-Bold.otf) format("opentype")',
          fontWeight: "bold",
          fontStyle: "normal",
        },
      ],
      body: {
        fontSize: "14px",
        lineHeight: "22.4px",
        background: "light",
      },
    },
  },
  colors: {
    primary: "#9E8666",
    secondary: "#F7F8FA",
    bglight: "#fbfbf",
    lightgray: "#F2F2F2",
    lightblue: "#E1EBFF",
    textlight: "#8d8d8d",
    green: { 500: "#26A21A" },
    red: { 500: "#FB5645" },
  },
  components: {
    Button,
    Tag,
    Heading: {
      baseStyle: {
        fontSize: "lg",
      },
    },
    Divider: {
      baseStyle: {
        borderColor: "gray.300",
        borderWidth: "2px",
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          _selected: {
            fontWeight: "bold",
            color: "#333",
          },
        },
      },
    },
    BottomNavigation: BottomNavigationStyles,
  },
});
export default customTheme;
