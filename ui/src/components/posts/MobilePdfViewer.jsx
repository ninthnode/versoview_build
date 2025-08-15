import React, { useState, useRef, useEffect } from "react";
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
import { FaExpand, FaCompress, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/pagination';

const MobilePdfViewer = ({ isOpen, onClose, title, libraryImages }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667
  });
  const swiperRef = useRef(null);

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
      // Landscape mode: first image single, then pairs
      const slides = [];
      
      // First image always single
      slides.push({
        type: 'single',
        images: [libraryImages[0]],
        key: 'cover-single'
      });

      // Remaining images in pairs
      for (let i = 1; i < libraryImages.length; i += 2) {
        if (i + 1 < libraryImages.length) {
          // Pair of images
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
      
      return slides;
    }
  };

  const slides = prepareSlides();

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
              <Tooltip label={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                <IconButton
                  icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                  onClick={toggleFullScreen}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                />
              </Tooltip>
              
              <Tooltip label="Close">
                <IconButton
                  icon={<Text fontSize="md">✖</Text>}
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  aria-label="Close PDF Viewer"
                />
              </Tooltip>
            </HStack>
          </Flex>
        </ModalHeader>
        
        <ModalBody p={0} height="100vh" position="relative">
          {slides.length > 0 ? (
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Zoom, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              zoom={{
                maxRatio: 3,
                minRatio: 1,
                toggle: true,
                containerClass: 'swiper-zoom-container',
                zoomedSlideClass: 'swiper-slide-zoomed'
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              style={{ 
                width: '100%', 
                height: '100%',
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
                '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.5)',
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={slide.key}>
                  <Box 
                    className="swiper-zoom-container"
                    height="100vh" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    bg="black"
                    position="relative"
                    pt="60px"
                  >
                    {slide.type === 'single' ? (
                      <Image 
                        src={slide.images[0]} 
                        alt={`Page ${index + 1}`}
                        objectFit="contain"
                        maxW="100%"
                        maxH="100%"
                        loading={index < 3 ? "eager" : "lazy"}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                    ) : (
                      <Flex 
                        width="100%" 
                        height="100%" 
                        alignItems="center" 
                        justifyContent="center"
                        gap={0}
                      >
                        <Box flex={1} height="100%" display="flex" alignItems="center" justifyContent="flex-end">
                          <Image 
                            src={slide.images[0]} 
                            alt={`Page ${(index * 2)}`}
                            objectFit="contain"
                            maxW="100%"
                            maxH="100%"
                            loading={index < 3 ? "eager" : "lazy"}
                            draggable={false}
                            style={{ userSelect: 'none' }}
                          />
                        </Box>
                        <Box flex={1} height="100%" display="flex" alignItems="center" justifyContent="flex-start">
                          <Image 
                            src={slide.images[1]} 
                            alt={`Page ${(index * 2) + 1}`}
                            objectFit="contain"
                            maxW="100%"
                            maxH="100%"
                            loading={index < 3 ? "eager" : "lazy"}
                            draggable={false}
                            style={{ userSelect: 'none' }}
                          />
                        </Box>
                      </Flex>
                    )}
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Text textAlign="center" color="white">
                No images found.
              </Text>
            </Flex>
          )}

          {/* Custom Navigation Buttons */}
          {slides.length > 1 && (
            <>
              <IconButton
                className="swiper-button-prev-custom"
                icon={<FaChevronLeft />}
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                zIndex={10}
                variant="ghost"
                size="lg"
                color="white"
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: "rgba(0,0,0,0.7)" }}
                aria-label="Previous"
              />
              
              <IconButton
                className="swiper-button-next-custom"
                icon={<FaChevronRight />}
                position="absolute"
                right={4}
                top="50%"
                transform="translateY(-50%)"
                zIndex={10}
                variant="ghost"
                size="lg"
                color="white"
                bg="rgba(0,0,0,0.5)"
                _hover={{ bg: "rgba(0,0,0,0.7)" }}
                aria-label="Next"
              />
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MobilePdfViewer;