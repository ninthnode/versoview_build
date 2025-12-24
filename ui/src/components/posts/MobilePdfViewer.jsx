import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Image,
  Flex,
  Box,
  Text,
  IconButton,
  Tooltip,
  HStack,
} from "@chakra-ui/react";
import { FaExpand, FaCompress } from "react-icons/fa";
import './style.css';

const MobilePdfViewer = ({ isOpen, onClose, title, libraryImages, mergedImages = [] }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);

  // Check if device is in landscape mode
  const isLandscape = windowDimensions.width > windowDimensions.height;
  
  // Debug logging
  console.log('Mobile PDF Viewer - Window dimensions:', windowDimensions);
  console.log('Mobile PDF Viewer - Is landscape:', isLandscape);

  // Update window dimensions on resize
  useEffect(() => {
    const updateWindowDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowDimensions({ width, height });
    };
    
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  // Auto fullscreen on mobile when modal opens
  useEffect(() => {
    // if (isOpen) {
    //   toggleFullScreen();
    // }
  }, [isOpen]);

  // Browser full-screen handling
  useEffect(() => {
    const fullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      
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

  // Prepare slides based on orientation
  const prepareSlides = () => {
    if (!libraryImages || libraryImages.length === 0) return [];

    if (!isLandscape) {
      // Portrait mode: all images single
      return libraryImages.map((image, index) => ({
        type: 'single',
        images: [image],
        key: `single-${index}`
      }));
    } else {
      // Landscape mode: use merged images if available, otherwise fallback to pairing
      const slides = [];
      
      // First image always single and centered
      slides.push({
        type: 'single',
        images: [libraryImages[0]],
        key: 'cover-single'
      });

      // Use merged images if available (they're already merged pairs)
      if (mergedImages && mergedImages.length > 0) {
        mergedImages.forEach((mergedImage, index) => {
          slides.push({
            type: 'merged',
            images: [mergedImage],
            key: `merged-${index}`
          });
        });
      } else {
        // Fallback: manually pair remaining images
        for (let i = 1; i < libraryImages.length; i += 2) {
          if (i + 1 < libraryImages.length) {
            // Pair of images with individual zoom containers
            slides.push({
              type: 'pair',
              images: [libraryImages[i], libraryImages[i + 1]],
              key: `pair-${i}`
            });
          } else {
            // Last single image
            slides.push({
              type: 'single',
              images: [libraryImages[i]],
              key: `single-${i}`
            });
          }
        }
      }
      
      return slides;
    }
  };

  const slides = prepareSlides();

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  // Swipe support (when not zoomed)
  const [swipeStartX, setSwipeStartX] = useState(null);
  const [swipeEndX, setSwipeEndX] = useState(null);

  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      e.preventDefault();
      setInitialDistance(getTouchDistance(e.touches));
      setInitialScale(scale);
      setIsPanning(false);
      setSwipeStartX(null);
      setSwipeEndX(null);
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Start panning when zoomed in
        e.preventDefault();
        setIsPanning(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else {
        // Start swipe
        setSwipeStartX(e.touches[0].clientX);
        setSwipeEndX(null);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scaleChange = currentDistance / initialDistance;
      const newScale = Math.min(3, Math.max(1, initialScale * scaleChange));
      setScale(newScale);

      if (newScale <= 1) {
        setTranslate({ x: 0, y: 0 });
        setLastTranslate({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      if (scale > 1 && isPanning) {
        // Pan when zoomed in
        e.preventDefault();
        const deltaX = e.touches[0].clientX - dragStart.x;
        const deltaY = e.touches[0].clientY - dragStart.y;
        setTranslate({
          x: lastTranslate.x + deltaX,
          y: lastTranslate.y + deltaY,
        });
      } else if (swipeStartX !== null) {
        // Track swipe
        setSwipeEndX(e.touches[0].clientX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastTranslate(translate);
    } else if (swipeStartX !== null && swipeEndX !== null && scale === 1) {
      const diff = swipeStartX - swipeEndX;
      const threshold = 50; // minimal swipe distance

      if (diff > threshold) {
        // swipe left -> next
        goNext();
      } else if (diff < -threshold) {
        // swipe right -> prev
        goPrev();
      }
    }

    setSwipeStartX(null);
    setSwipeEndX(null);
  };

  // Reset zoom when slide changes or modal closes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setLastTranslate({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent 
        height="100vh" 
        maxH="100vh"
        maxW="100%"
        m={0}
        borderRadius={0}
        bg="black"
      >
        <ModalHeader 
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={10}
          bg="rgba(0,0,0,0.7)"
          backdropFilter="blur(10px)"
          py={2}
          px={4}
          transition="all 0.3s ease"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" color="white" noOfLines={1}>
              {title}
            </Text>
            <HStack spacing={2}>
              {/* <Tooltip label={isFullScreen ? "Exit Full Screen" : "Full Screen"}> */}
                <IconButton
                  icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                  onClick={toggleFullScreen}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                />
              {/* </Tooltip> */}
              
              {/* <Tooltip label="Close"> */}
                <IconButton
                  icon={<Text fontSize="md">✖</Text>}
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  aria-label="Close PDF Viewer"
                />
              {/* </Tooltip> */}
            </HStack>
          </Flex>
        </ModalHeader>
        
        <ModalBody 
          p={0} 
          height="100vh" 
          position="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.length > 0 ? (
            <Box 
              height="100vh" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bg="black"
              position="relative"
              pt="60px"
            >
              {(() => {
                const slide = slides[currentIndex];
                if (!slide) return null;

                const zoomStyle = {
                  transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.2s ease',
                  touchAction: 'none',
                };

                if (slide.type === 'single') {
                  return (
                    <Box
                      width="100%"
                      height="100%"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={zoomStyle}
                    >
                      <Image 
                        src={slide.images[0]} 
                        alt={`Page ${currentIndex + 1}`}
                        objectFit="contain"
                        maxW="100%"
                        maxH="100%"
                        loading={currentIndex < 3 ? "eager" : "lazy"}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                    </Box>
                  );
                }

                // Handle merged images (single image that's already merged) or pairs
                if (slide.type === 'merged') {
                  // Merged image - single image that contains two pages side by side
                  return (
                    <Box
                      width="100%"
                      height="100%"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={zoomStyle}
                    >
                      <Image 
                        src={slide.images[0]} 
                        alt={`Merged pages ${currentIndex}`}
                        objectFit="contain"
                        maxW="100%"
                        maxH="100%"
                        loading={currentIndex < 3 ? "eager" : "lazy"}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                    </Box>
                  );
                }

                // Fallback: pair of separate images
                return (
                  <Box
                    width="100%"
                    height="100%"
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={zoomStyle}
                  >
                    <Flex
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                    >
                      <Image 
                        src={slide.images[0]} 
                        alt={`Page ${currentIndex * 2}`}
                        objectFit="contain"
                        maxW="50%"
                        maxH="100%"
                        loading={currentIndex < 3 ? "eager" : "lazy"}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                      <Image 
                        src={slide.images[1]} 
                        alt={`Page ${currentIndex * 2 + 1}`}
                        objectFit="contain"
                        maxW="50%"
                        maxH="100%"
                        loading={currentIndex < 3 ? "eager" : "lazy"}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                    </Flex>
                  </Box>
                );
              })()}
            </Box>
          ) : (
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Text textAlign="center" color="white">
                No images found.
              </Text>
            </Flex>
          )}

                  {/* Navigation via swipe only; arrows removed */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MobilePdfViewer;