import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles as Button } from "./components/ButtonStyles";
import { TagStyles as Tag } from "./components/TagStyles";
import BottomNavigationStyles from "./components/BottomNavigation";

const customTheme = extendTheme({
  fonts: {
    body: "NotoSans-Bold, sans-serif",
    heading: "Poppins-ExtraBold, sans-serif",
    button: "NotoSans-Bold, sans-serif",
    p: "NotoSans-Medium, sans-serif",
    span: "NotoSans-Regular, sans-serif",
  },
  fontSizes: {
    xs: "0.7rem",
    sm: "0.865rem",
    md: "1rem",
    lg: "1.55rem",
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
          fontFamily: "NotoSans-Regular",
          src: 'url(/fonts/NotoSans-Regular.ttf) format("truetype")',
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
        fontFamily: "NotoSans-Regular",
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
