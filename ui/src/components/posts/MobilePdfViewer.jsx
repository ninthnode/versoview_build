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
import './style.css';

// Component to merge two images side by side without quality loss
const MergedImage = ({ leftImage, rightImage, alt }) => {
  const [mergedImageSrc, setMergedImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!leftImage || !rightImage) {
      console.log('Missing images:', { leftImage, rightImage });
      return;
    }

    console.log('Starting image merge:', { leftImage, rightImage });
    setIsLoading(true);
    setError(null);

    const mergeImages = async () => {
      try {
        // Wait for next tick to ensure canvas is rendered
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Create canvas if ref is not available
        let canvas = canvasRef.current;
        if (!canvas) {
          console.log('Creating new canvas element');
          canvas = document.createElement('canvas');
        }

        // Function to convert image URL to data URL via proxy
        const imageUrlToDataUrl = async (url) => {
          // If it's already a data URL, return as is
          if (url.startsWith('data:')) {
            return url;
          }
          
          const proxiedUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/image-proxy?url=` + encodeURIComponent(url);
          const response = await fetch(proxiedUrl, { mode: 'cors' });
          const blob = await response.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        };

        // Convert both images to data URLs first
        const [leftDataUrl, rightDataUrl] = await Promise.all([
          imageUrlToDataUrl(leftImage),
          imageUrlToDataUrl(rightImage)
        ]);

        // Create image elements using native Image constructor
        const img1 = new window.Image();
        const img2 = new window.Image();

        // Load both images from data URLs
        const loadImage = (img, src) => new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`Image loaded: ${src.substring(0, 50)}..., dimensions: ${img.width}x${img.height}`);
            resolve(img);
          };
          img.onerror = (e) => {
            console.error(`Failed to load image: ${src.substring(0, 50)}...`, e);
            reject(e);
          };
          img.src = src;
        });

        const [leftImg, rightImg] = await Promise.all([
          loadImage(img1, leftDataUrl),
          loadImage(img2, rightDataUrl)
        ]);

        // Calculate dimensions - maintain aspect ratio
        const maxHeight = Math.max(leftImg.height, rightImg.height);
        const leftWidth = (leftImg.width / leftImg.height) * maxHeight;
        const rightWidth = (rightImg.width / rightImg.height) * maxHeight;
        const totalWidth = leftWidth + rightWidth;

        console.log('Canvas dimensions:', { totalWidth, maxHeight });
        
        canvas.width = totalWidth;
        canvas.height = maxHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, totalWidth, maxHeight);
        
        // Draw left image
        ctx.drawImage(leftImg, 0, 0, leftWidth, maxHeight);
        
        // Draw right image
        ctx.drawImage(rightImg, leftWidth, 0, rightWidth, maxHeight);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/png', 1.0);
        console.log('Merged image created, data URL length:', dataURL.length);
        setMergedImageSrc(dataURL);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error merging images:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    mergeImages();
  }, [leftImage, rightImage]);

  // Touch event handlers for custom zoom
  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      e.preventDefault();
      setInitialDistance(getTouchDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag when zoomed
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
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
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan when zoomed
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      
      setTranslate({
        x: lastTranslate.x + deltaX,
        y: lastTranslate.y + deltaY
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (isDragging) {
      setIsDragging(false);
      setLastTranslate(translate);
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setLastTranslate({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  if (error) {
    return (
      <Box color="white" textAlign="center" p={4}>
        <Text>Error loading images</Text>
        <Text fontSize="sm">{error}</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box color="white" textAlign="center" p={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {mergedImageSrc && (
        <div
          ref={imageRef}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <img 
            src={mergedImageSrc}
            alt={alt}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            draggable={false}
            onLoad={() => {
              console.log('Merged image loaded with custom zoom');
            }}
          />
        </div>
      )}
    </>
  );
};

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
      
      // First image always single and centered
      slides.push({
        type: 'single',
        images: [libraryImages[0]],
        key: 'cover-single'
      });

      // Remaining images in pairs - each pair gets individual zoom containers
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
              touchEventsTarget="container"
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
                // Store swiper instance globally for merged image updates
                window.swiper = swiper;
                console.log('Swiper instance stored');
              }}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={slide.key}>
                  <Box 
                    height="100vh" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    bg="black"
                    position="relative"
                    pt="60px"
                  >
                    {slide.type === 'single' ? (
                      <div className="swiper-zoom-container">
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
                      </div>
                    ) : (
                      <MergedImage
                        leftImage={slide.images[0]}
                        rightImage={slide.images[1]}
                        alt={`Pages ${(index * 2)} - ${(index * 2) + 1}`}
                      />
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