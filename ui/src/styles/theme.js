import { extendTheme } from '@chakra-ui/react'
import {ButtonStyles as Button} from './components/ButtonStyles'
import {TagStyles as Tag} from './components/TagStyles'
import BottomNavigationStyles from './components/BottomNavigation'

const customTheme = extendTheme({
    fonts:{
      body: 'Rethink Sans, sans-serif',
      heading: 'Rethink Sans, sans-serif',
    },
    fontWeights: {
      normal: 500,
    },  
    styles: {
      global: {
        body: {
          fontSize: '14px',
          lineHeight: '22.4px',
          background: 'light'
        },
      },
    },
    colors:{
      primary: '#9E8666',
      secondary: '#F7F8FA',
      bglight:'#fbfbf',
      lightgray:'#e5e5e5',
      lightblue:'#E1EBFF',
  },
  components: {
    Button,
    Tag,
    Heading: {
      baseStyle: {
        fontSize: "sm",
      }
    },
    BottomNavigation: BottomNavigationStyles
  },

})
export default customTheme;