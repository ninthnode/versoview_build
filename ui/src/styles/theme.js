import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles as Button } from "./components/ButtonStyles";
import { TagStyles as Tag } from "./components/TagStyles";
import BottomNavigationStyles from "./components/BottomNavigation";

const customTheme = extendTheme({
  fonts: {
    body: "Lato-Bold, sans-serif",
    heading: "Lato-Bold, sans-serif",
    button: "Lato-Bold, sans-serif",
    p: "PTSerif-Regular, sans-serif",
    span: "PTSerif-Regular, sans-serif",
  },
  fontSizes: {
    xs: "0.7rem",
    xsm: "0.75rem",
    sm: "0.865rem",
    md: "1rem",
    mdl: "1.34rem",
    lg: "1.74rem",
    xl: "2.2rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
    "4xl": "3rem",
    "5xl": "4rem",
    "6xl": "5rem",
  },
  fontWeights: {
    normal: 400,
    semibold:600,
    bold:700,
    extrabold:800,
  },
  styles: {
    global: {
      "@font-face": [
        {
          fontFamily: "PTSerif-Regular",
          src: 'url(/fonts/PTSerif-Regular.ttf) format("truetype")',
          fontWeight: "normal",
        },
        {
          fontFamily: "NotoSans-SemiBold",
          src: 'url(/fonts/NotoSans-SemiBold.ttf) format("truetype")',
          fontWeight: "semibold",
        },
        {
          fontFamily: "NotoSans-Bold",
          src: 'url(/fonts/NotoSans-Bold.ttf) format("truetype")',
          fontWeight: "bold",
        },
        {
          fontFamily: "Poppins-ExtraBold",
          src: 'url(/fonts/Poppins-ExtraBold.ttf) format("truetype")',
          fontWeight: "extrabold",
        },
      ],
      body: {
        fontFamily: "PTSerif-Regular",
        fontSize: "0.875rem",
        lineHeight: "22.4px",
        fontWeight: "normal",
      },
      heading:{
        fontFamily: "Poppins-ExtraBold",
      },
      a: {
        lineHeight: "22.4px",
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
