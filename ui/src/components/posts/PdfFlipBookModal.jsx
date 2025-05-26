import React, { useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Image,
  Flex,
  Box,
  Text,
  IconButton,
  Tooltip,
  useBreakpointValue,
  HStack,
  Button,
} from "@chakra-ui/react";
import { FaExpand, FaCompress, FaDesktop, FaWindowRestore } from "react-icons/fa";
import "./style.css";
import useDeviceType from "@/components/useDeviceType";
import {getLibraryImagesForPageTurner} from "../../redux/publish/publishActions";
import { useDispatch,useSelector } from "react-redux";

const PdfFlipBookModal = ({ title,editionId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deviceType = useDeviceType();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({
    width: 0,
    height: 0
  });
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const flipBookRef = useRef(null);
  const modalBodyRef = useRef(null);
  const flipBookContainerRef = useRef(null);
  const dispatch = useDispatch();  
  // Update window dimensions on resize
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);
  
  // Calculate modal dimensions after open or resize
  useEffect(() => {
    if (isOpen && modalBodyRef.current) {
      const updateDimensions = () => {
        const rect = modalBodyRef.current.getBoundingClientRect();
        setModalDimensions({
          width: rect.width,
          height: rect.height
        });
      };
      
      // Update dimensions initially and on resize
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [isOpen]);

  // Browser full-screen handling
  useEffect(() => {
    const fullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      
      // Update dimensions after fullscreen change
      if (document.fullscreenElement) {
        setTimeout(() => {
          setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight
          });
        }, 100);
      }
    };
    
    document.addEventListener('fullscreenchange', fullScreenChange);
    document.addEventListener('webkitfullscreenchange', fullScreenChange);
    document.addEventListener('mozfullscreenchange', fullScreenChange);
    document.addEventListener('MSFullscreenChange', fullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', fullScreenChange);
      document.removeEventListener('webkitfullscreenchange', fullScreenChange);
      document.removeEventListener('mozfullscreenchange', fullScreenChange);
      document.removeEventListener('MSFullscreenChange', fullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      // Go directly to full screen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .catch(err => console.error("Error attempting to enable full-screen mode:", err));
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      // Exit full screen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .catch(err => console.error("Error attempting to exit full-screen mode:", err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };
  
  // Default modal size
  const modalSize = useBreakpointValue({
    base: "full",
    md: "full",
    lg: "full",
  });
  
  // Always call useBreakpointValue first, outside of any conditions
  const baseBreakpointDimensions = useBreakpointValue({
    base: { width: 400, height: 550 },
    sm: { width: 450, height: 600 },
    md: { width: 500, height: 650 },
    lg: { width: 500, height: 650 },
  });
  
  // Calculate optimal book dimensions based on screen size
  const finalBookDimensions = React.useMemo(() => {
    // Always use maximum possible size, whether in full screen or not
    if (isFullScreen) {
      // Use browser full screen dimensions
      const screenWidth = windowDimensions.width;
      const screenHeight = windowDimensions.height - 60; // Allow space for header
      
      // Calculate optimal size based on screen orientation
      if (screenWidth > screenHeight) {
        // Landscape orientation
        const optimalHeight = screenHeight * 0.9;
        const optimalWidth = screenWidth * 0.8 / 2; // Two pages
        
        return {
          width: Math.min(optimalWidth, optimalHeight * 0.75),
          height: optimalHeight
        };
      } else {
        // Portrait orientation
        const optimalWidth = screenWidth * 0.9 / 2; // Two pages side by side
        const optimalHeight = screenHeight * 0.9;
        
        return {
          width: optimalWidth,
          height: Math.min(optimalHeight, optimalWidth / 0.7)
        };
      }
    } else if (modalDimensions.width > 0 && modalDimensions.height > 0) {
      // Use maximum modal dimensions
      const availableWidth = modalDimensions.width - 10;
      const availableHeight = modalDimensions.height - 10;
      
      // Calculate optimal size based on modal orientation
      if (availableWidth > availableHeight) {
        // Landscape orientation
        const optimalHeight = availableHeight;
        const optimalWidth = availableWidth / 2; // Two pages side by side
        
        return {
          width: Math.min(optimalWidth, optimalHeight * 0.75),
          height: optimalHeight
        };
      } else {
        // Portrait orientation
        const optimalWidth = availableWidth / 2; // Two pages side by side
        const optimalHeight = availableHeight;
        
        return {
          width: optimalWidth,
          height: Math.min(optimalHeight, optimalWidth / 0.7)
        };
      }
    }
    
    // Default dimensions
    return baseBreakpointDimensions || { width: 500, height: 650 };
  }, [isFullScreen, modalDimensions, windowDimensions, baseBreakpointDimensions]);

  const loadImages = () => {
    dispatch(getLibraryImagesForPageTurner(editionId));
  }

    const { 
    libraryImages, 
  } = useSelector((state) => state.publish);
  return (
    <Box>
      <Flex 
        cursor="pointer" 
        onClick={()=>{loadImages(); onOpen();}} 
        alignItems="center"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
      >
        <Image src="/assets/book.svg" h="1.2rem" w="1.4rem" mr={2} />
      </Flex>
      
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={modalSize}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
        <ModalContent 
          height="95vh" 
          maxH="95vh"
          maxW={{ base: "100%", md: "95%", lg: "90%" }}
          m="auto"
          borderRadius="md"
          boxShadow="xl"
        >
          <ModalHeader 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            borderBottomWidth="1px"
            borderColor="gray.100"
            py={3}
            px={4}
            transition="all 0.3s ease"
            opacity={isFullScreen ? 0.7 : 1}
            _hover={{ opacity: 1 }}
            position={isFullScreen ? "absolute" : "relative"}
            bg={isFullScreen ? "rgba(255,255,255,0.9)" : "transparent"}
            w="100%"
            zIndex="2"
          >
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" noOfLines={1}>
              {title}
            </Text>
            <HStack spacing={2}>
              <Tooltip label={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                <IconButton
                  icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                  onClick={toggleFullScreen}
                  variant="ghost"
                  size="sm"
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                />
              </Tooltip>
              <Tooltip label="Close">
                <IconButton
                  icon={<Text fontSize="md">✖</Text>}
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  aria-label="Close PDF Viewer"
                />
              </Tooltip>
            </HStack>
          </ModalHeader>
          
          <ModalBody 
            ref={modalBodyRef}
            minH="50vh" 
            height="100%" 
            overflow="hidden" 
            p={{ base: isFullScreen ? 0 : 1, md: isFullScreen ? 0 : 2 }}
            pt={isFullScreen ? "3.5rem" : { base: 1, md: 2 }}
            transition="all 0.3s ease"
            position="relative"
          >
            <Box
              ref={flipBookContainerRef}
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bg={{ base: "#f8f9fa", md: "#2d3748" }}
              p={isFullScreen ? 0 : { base: 1, md: 2 }}
              borderRadius={isFullScreen ? "0" : "md"}
              minH={{ base: "500px", md: "600px" }}
              height="100%"
              width="100%"
              transition="all 0.3s ease"
            >
              {libraryImages && libraryImages.length > 0 ? (
                <HTMLFlipBook
                  ref={flipBookRef}
                  maxWidth={finalBookDimensions.width}
                  maxHeight={finalBookDimensions.height}
                  height={finalBookDimensions.height}
                  width={finalBookDimensions.width}
                  size="stretch"
                  minWidth={300}
                  minHeight={400}
                  enableBackground={true}
                  pageBackground="#333"
                  autoSize={true}
                  showCover={true}
                  usePortrait={true}
                  mobileScrollSupport={true}
                  flippingTime={800}
                  startPage={0}
                  clickEventForward={false}
                  useMouseEvents={true}
                  style={{ margin: "auto" }}
                  drawShadow={true}
                  maxShadowOpacity={0.5}
                  isClickFlip={true}
                >
                  {libraryImages.map((image, index) => (
                    <div key={index} className="pdf-page">
                      <Image 
                        src={image} 
                        alt={`Page ${index + 1}`} 
                        objectFit="contain"
                        loading={index < 2 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}
                </HTMLFlipBook>
              ) : (
                <Text textAlign="center" color={{ base: "gray.800", md: "white" }}>
                  No images found.
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PdfFlipBookModal;