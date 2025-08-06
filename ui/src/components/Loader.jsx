import React,{useState,useEffect} from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

const FullScreenLoader = ({ showtext,text }) => {
  return (
    <Box
      position="fixed"
      overflowY="hidden"
      top='50%'
      left='50%'
      transform={'translate(-50%,-50%)'}
      width="100px"
      height="100px"
      zIndex="9999"
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="white"
      bg='transparent'
    >
      <Box textAlign="center">
        <Spinner size="lg" color="#333" />
        {showtext?<Text>{text}</Text>:''}
      </Box>
    </Box>
  );
};

const Loader = ({ messages, showtext }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
      if (messages && messages.length > 0) {
          const interval = setInterval(() => {
              setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
          }, 2000);

          return () => clearInterval(interval);
      }
  }, [messages]);

  const text = messages && messages.length > 0 ? messages[currentMessageIndex] : null;

  return <FullScreenLoader showtext={showtext} text={text} />;
};


export default Loader;
