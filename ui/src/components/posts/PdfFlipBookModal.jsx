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
  VStack,
  Divider,
} from "@chakra-ui/react";
import { FaExpand, FaCompress, FaSearchPlus, FaSearchMinus, FaUndo, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./style.css";
import useDeviceType from "@/components/useDeviceType";
import {getLibraryImagesForPageTurner} from "../../redux/publish/publishActions";
import { useDispatch,useSelector } from "react-redux";
import MobilePdfViewer from "./MobilePdfViewer";

const PdfFlipBookModal = ({ title,editionId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const handleClose = () => {
    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => onClose())
          .catch(err => {
            console.error("Error attempting to exit full-screen mode:", err);
            onClose();
          });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        setTimeout(() => onClose(), 100);
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        setTimeout(() => onClose(), 100);
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        setTimeout(() => onClose(), 100);
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };
  const deviceType = useDeviceType();
  
  // Enhanced mobile detection including landscape mode
  const isMobileDevice = () => {
    return deviceType === 'phone' || 
           (deviceType === 'tablet' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({
    width: 0,
    height: 0
  });
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  
  // Helper function to calculate initial values based on window height
  const getInitialValues = () => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    const zoomLevel = deviceType === 'phone' ? 1.5 : (height >= 800 ? 2 : 1.75);
    const panY = height >= 800 ? 30 : 20;
    return {
      zoomLevel,
      panOffset: { x: 0, y: panY },
      lastPanOffset: { x: 0, y: panY }
    };
  };

  const initialValues = getInitialValues();
  
  // Zoom state - Dynamic based on window height
  const [zoomLevel, setZoomLevel] = useState(initialValues.zoomLevel);
  
  // Auto mode based on zoom level
  const defaultZoomLevel = getInitialValues().zoomLevel;
  const isZoomedIn = zoomLevel > defaultZoomLevel;
  const currentMode = isZoomedIn ? 'pan' : 'turner';
  const [panOffset, setPanOffset] = useState(initialValues.panOffset);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState(initialValues.lastPanOffset);
  
  const flipBookRef = useRef(null);
  const modalBodyRef = useRef(null);
  const flipBookContainerRef = useRef(null);
  const dispatch = useDispatch();

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;
  console.log("Device Height",window.innerHeight);
  let DEFAULT_ZOOM;

if (deviceType === 'phone') {
  DEFAULT_ZOOM = 1.5;
} else {
  DEFAULT_ZOOM = window.innerHeight >= 800 ? 2 : 1.75;
}
  // Update window dimensions and device type on resize
  useEffect(() => {
    const updateWindowDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowDimensions({ width, height });
      setIsDesktop(width >= 768); // Desktop if width >= 768px
    };
    
    // Set initial state
    updateWindowDimensions();
    
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);
  
  // Calculate modal dimensions after open or resize
  useEffect(() => {
    if (isOpen && modalBodyRef.current) {
      console.log("Device Type",deviceType);
      if(deviceType != 'phone') {
        toggleFullScreen()
      }
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

  // Mouse wheel zoom handling
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        handleZoom(delta);
      }
    };

    if (isOpen && flipBookContainerRef.current) {
      const container = flipBookContainerRef.current;
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isOpen, zoomLevel]);

  // Mouse drag handling for panning - only when zoomed in
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && isZoomedIn) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        setPanOffset({
          x: lastPanOffset.x + deltaX,
          y: lastPanOffset.y + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setLastPanOffset(panOffset);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, lastPanOffset, panOffset, zoomLevel, isZoomedIn]);

  // Reset zoom and pan when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const values = getInitialValues();
      setZoomLevel(values.zoomLevel);
      setPanOffset(values.panOffset);
      setLastPanOffset(values.lastPanOffset);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Stop dragging when zooming out
  useEffect(() => {
    if (!isZoomedIn) {
      setIsDragging(false);
    }
  }, [isZoomedIn]);

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

  const handleZoom = (delta) => {
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    // Reset pan when zooming out to default or less
    const defaultZoom = getInitialValues().zoomLevel;
    if (newZoom <= defaultZoom) {
      const values = getInitialValues();
      setPanOffset(values.panOffset);
      setLastPanOffset(values.lastPanOffset);
    }
  };

  const handleZoomSlider = (value) => {
    setZoomLevel(value);
    
    // Reset pan when zooming out to default or less
    const defaultZoom = getInitialValues().zoomLevel;
    if (value <= defaultZoom) {
      const values = getInitialValues();
      setPanOffset(values.panOffset);
      setLastPanOffset(values.lastPanOffset);
    }
  };

  const handleZoomIn = () => handleZoom(ZOOM_STEP);
  const handleZoomOut = () => handleZoom(-ZOOM_STEP);
  
  const handleResetZoom = () => {
    const values = getInitialValues();
    setZoomLevel(values.zoomLevel);
    setPanOffset(values.panOffset);
    setLastPanOffset(values.lastPanOffset);
  };

  const handleMouseDown = (e) => {
    if (isZoomedIn) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Navigation functions for arrows
  const handlePrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };


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
  
  // Calculate optimal book dimensions based on screen size and device type
  const finalBookDimensions = React.useMemo(() => {
    const isMobile = !isDesktop;
    
    // Always use maximum possible size, whether in full screen or not
    if (isFullScreen) {
      // Use browser full screen dimensions
      const screenWidth = windowDimensions.width;
      const screenHeight = windowDimensions.height - 60; // Allow space for header
      
      if (isMobile) {
        // Mobile: single page layout
        const optimalWidth = screenWidth * 0.9;
        const optimalHeight = screenHeight * 0.9;
        
        return {
          width: Math.min(optimalWidth, optimalHeight * 0.7),
          height: Math.min(optimalHeight, optimalWidth / 0.7)
        };
      } else {
        // Desktop: dual page layout
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
      }
    } else if (modalDimensions.width > 0 && modalDimensions.height > 0) {
      // Use maximum modal dimensions
      const availableWidth = modalDimensions.width - 10;
      const availableHeight = modalDimensions.height - 10;
      
      if (isMobile) {
        // Mobile: single page layout
        const optimalWidth = availableWidth;
        const optimalHeight = availableHeight;
        
        return {
          width: Math.min(optimalWidth, optimalHeight * 0.7),
          height: Math.min(optimalHeight, optimalWidth / 0.7)
        };
      } else {
        // Desktop: dual page layout
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
    }
    
    // Default dimensions based on device type
    const defaultDimensions = baseBreakpointDimensions || { width: 500, height: 650 };
    
    if (isMobile) {
      return {
        width: defaultDimensions.width,
        height: defaultDimensions.height
      };
    } else {
      return {
        width: defaultDimensions.width,
        height: defaultDimensions.height
      };
    }
  }, [isFullScreen, modalDimensions, windowDimensions, baseBreakpointDimensions, isDesktop]);

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
      
      {/* Render Mobile PDF Viewer for mobile devices (including landscape) */}
      {isMobileDevice() ? (
        <MobilePdfViewer
          isOpen={isOpen}
          onClose={handleClose}
          title={title}
          libraryImages={libraryImages}
        />
      ) : (
        /* Desktop PDF Viewer */
        <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
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
            display={{ base: "block", md: "flex" }}
            justifyContent={{ md: "space-between" }}
            alignItems={{ md: "center" }}
            borderBottomWidth="1px"
            borderColor="gray.100"
            py={3}
            px={4}
            transition="all 0.3s ease"
            opacity={isFullScreen ? 0.7 : 1}
            _hover={{ opacity: 1 }}
            position={ "relative"}
            bg={isFullScreen ? "rgba(255,255,255,0.9)" : "transparent"}
            w="100%"
            zIndex="2"
          >
            {/* Mobile Layout */}
            <Box display={{ base: "block", md: "none" }}>
              <VStack spacing={3} align="stretch">
                {/* Title and action buttons row */}
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
                    {title}sdds
                  </Text>
                  <HStack spacing={2}>
                    {/* <Tooltip label={isFullScreen ? "Exit Full Screen" : "Full Screen"}> */}
                      <IconButton
                        icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                        onClick={toggleFullScreen}
                        variant="ghost"
                        size="sm"
                        aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                      />
                    {/* </Tooltip> */}
                    
                    <Tooltip label="Close">
                      <IconButton
                        icon={<Text fontSize="md">✖</Text>}
                        onClick={handleClose}
                        variant="ghost"
                        size="sm"
                        aria-label="Close PDF Viewer"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>

                {/* Zoom Controls */}
                <Flex 
                  justify="center" 
                  align="center" 
                  wrap="wrap" 
                  gap={3}
                  pt={1}
                >
                  <Tooltip label="Zoom Out">
                    <IconButton
                      icon={<FaSearchMinus />}
                      onClick={handleZoomOut}
                      variant="ghost"
                      size="sm"
                      isDisabled={zoomLevel <= MIN_ZOOM}
                      aria-label="Zoom Out"
                    />
                  </Tooltip>
                  
                  <Text fontSize="xs" minW="4rem" textAlign="center" fontWeight="semibold">
                    {Math.round(zoomLevel * 100)}%
                  </Text>
                  
                  <Tooltip label="Zoom In">
                    <IconButton
                      icon={<FaSearchPlus />}
                      onClick={handleZoomIn}
                      variant="ghost"
                      size="sm"
                      isDisabled={zoomLevel >= MAX_ZOOM}
                      aria-label="Zoom In"
                    />
                  </Tooltip>
                  
                  <Tooltip label="Reset Zoom">
                    <IconButton
                      icon={<FaUndo />}
                      onClick={handleResetZoom}
                      variant="ghost"
                      size="sm"
                      isDisabled={(() => {
                        const values = getInitialValues();
                        return zoomLevel === values.zoomLevel && panOffset.x === values.panOffset.x && panOffset.y === values.panOffset.y;
                      })()}
                      aria-label="Reset Zoom"
                    />
                  </Tooltip>
                </Flex>
              </VStack>
            </Box>

            {/* Desktop Layout */}
            <Box display={{ base: "none", md: "flex" }} w="100%" justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                {title}
              </Text>
              <HStack spacing={4}>
                {/* Zoom Controls */}
                <HStack spacing={2}>
                  <Tooltip label="Zoom Out">
                    <IconButton
                      icon={<FaSearchMinus />}
                      onClick={handleZoomOut}
                      variant="ghost"
                      size="sm"
                      isDisabled={zoomLevel <= MIN_ZOOM}
                      aria-label="Zoom Out"
                    />
                  </Tooltip>
                  
                  <Text fontSize="xs" minW="4rem" textAlign="center" fontWeight="semibold">
                    {Math.round(zoomLevel * 100)}%
                  </Text>
                  
                  <Tooltip label="Zoom In">
                    <IconButton
                      icon={<FaSearchPlus />}
                      onClick={handleZoomIn}
                      variant="ghost"
                      size="sm"
                      isDisabled={zoomLevel >= MAX_ZOOM}
                      aria-label="Zoom In"
                    />
                  </Tooltip>
                  
                  <Tooltip label="Reset Zoom">
                    <IconButton
                      icon={<FaUndo />}
                      onClick={handleResetZoom}
                      variant="ghost"
                      size="sm"
                      isDisabled={(() => {
                        const values = getInitialValues();
                        return zoomLevel === values.zoomLevel && panOffset.x === values.panOffset.x && panOffset.y === values.panOffset.y;
                      })()}
                      aria-label="Reset Zoom"
                    />
                  </Tooltip>
                </HStack>
                
                <Divider orientation="vertical" h="2rem" />
                
                {/* <Tooltip label={isFullScreen ? "Exit Full Screen" : "Full Screen"}> */}
                  <IconButton
                    icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                    onClick={toggleFullScreen}
                    variant="ghost"
                    size="sm"
                    aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  />
                {/* </Tooltip> */}
                
                <Tooltip label="Close">
                  <IconButton
                    icon={<Text fontSize="md">✖</Text>}
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    aria-label="Close PDF Viewer"
                  />
                </Tooltip>
              </HStack>
            </Box>
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
              overflow="hidden"
              cursor={
                isZoomedIn
                  ? (isDragging ? 'grabbing' : 'grab') 
                  : 'default'
              }
              onMouseDown={handleMouseDown}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              {/* Navigation Arrows - Only show on desktop when pan mode is active */}
              {isDesktop && isZoomedIn && (
                <>
                  {/* Previous Page Arrow */}
                  <IconButton
                    icon={<FaChevronLeft />}
                    onClick={handlePrevPage}
                    position="absolute"
                    left="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="10"
                    size="lg"
                    variant="solid"
                    colorScheme="whiteAlpha"
                    bg="rgba(0, 0, 0, 0.6)"
                    color="white"
                    _hover={{
                      bg: "rgba(0, 0, 0, 0.8)",
                      transform: "translateY(-50%) scale(1.1)"
                    }}
                    _active={{
                      bg: "rgba(0, 0, 0, 0.9)"
                    }}
                    borderRadius="full"
                    boxShadow="lg"
                    aria-label="Previous Page"
                  />
                  
                  {/* Next Page Arrow */}
                  <IconButton
                    icon={<FaChevronRight />}
                    onClick={handleNextPage}
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="10"
                    size="lg"
                    variant="solid"
                    colorScheme="whiteAlpha"
                    bg="rgba(0, 0, 0, 0.6)"
                    color="white"
                    _hover={{
                      bg: "rgba(0, 0, 0, 0.8)",
                      transform: "translateY(-50%) scale(1.1)"
                    }}
                    _active={{
                      bg: "rgba(0, 0, 0, 0.9)"
                    }}
                    borderRadius="full"
                    boxShadow="lg"
                    aria-label="Next Page"
                  />
                </>
              )}

              <Box
                transform={`scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`}
                transformOrigin="center center"
                transition={isDragging ? 'none' : 'transform 0.2s ease'}
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
                    usePortrait={!isDesktop} // Portrait mode for mobile, landscape for desktop
                    mobileScrollSupport={true}
                    flippingTime={800}
                    startPage={0}
                    clickEventForward={false}
                    useMouseEvents={!isZoomedIn} // Only enable mouse events when not zoomed in
                    style={{ 
                      margin: "auto", 
                      pointerEvents: !isZoomedIn ? 'auto' : 'none' // Only allow interaction when not zoomed in
                    }}
                    drawShadow={true}
                    maxShadowOpacity={0.5}
                    isClickFlip={!isZoomedIn} // Only enable click flip when not zoomed in
                  >
                    {/* Cover page - always single */}
                    {libraryImages.length > 0 && (
                      <div key="cover" className="pdf-page">
                        <Image 
                          src={libraryImages[0]} 
                          alt="Cover"
                          objectFit="contain"
                          loading="eager"
                          draggable={false}
                          style={{ userSelect: 'none' }}
                        />
                      </div>
                    )}
                    
                    {/* Content pages */}
                    {libraryImages.slice(1).map((image, index) => (
                      <div key={`page-${index + 1}`} className="pdf-page">
                        <Image 
                          src={image} 
                          alt={`Page ${index + 2}`}
                          objectFit="contain"
                          loading={index < 4 ? "eager" : "lazy"}
                          draggable={false}
                          style={{ userSelect: 'none' }}
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
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      )}
    </Box>
  );
};

export default PdfFlipBookModal;