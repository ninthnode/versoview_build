import React,{useState,useEffect} from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

const FullScreenLoader = ({ showtext,text }) => {
  return (
    <Box
      position="fixed"
      overflowY="hidden"
      top={0}
      left={0}
      width="100%"
      height="100vh"
      bg="secondary"
      zIndex="9999"
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="white"
    >
      <Box textAlign="center">
        <Spinner size="lg" color="white" />
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
