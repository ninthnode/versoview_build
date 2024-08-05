import { withDefaultStyles } from "chakra-ui-bottom-navigation";
const bottomNavigationOverries = {
  baseStyle: {
    item: {
      // _selected: {
      //   color: "green",
      // },
      opacity:1,
      color:'#333',
      margin: "0",
    },
  },
};

const BottomNavigationStyles = withDefaultStyles(
  bottomNavigationOverries
);
export default BottomNavigationStyles