import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image as ChakraImage,
  Flex,
  Input,
  Box,
  Button,
  Text,
  IconButton,
  Skeleton,
  Spinner,
  useToast,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FaUpload, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  getLibraryImages,
  uploadLibraryImage,
} from "@/redux/publish/publishActions";

const ITEMS_PER_PAGE = 12; // Show 12 images per page for better UX
const MERGE_BATCH_SIZE = 4; // Process merging in smaller batches

const LibraryImageSelector = ({
  isOpen,
  onClose,
  editionId,
  onImageSelect,
  mergeImages = true,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSizeError, setImageSizeError] = useState("");
  const [imageLoaded, setImageLoaded] = useState({});
  const [mergedImages, setMergedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMerging, setIsMerging] = useState(false);
  const [mergingProgress, setMergingProgress] = useState({ current: 0, total: 0 });

  const dispatch = useDispatch();
  const toast = useToast();
  const {
    libraryImages,
    libraryLoading,
    libraryError,
    libraryUploadLoading,
    libraryUploadError,
  } = useSelector((state) => state.publish);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalItems = mergedImages.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = mergedImages.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPageItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [mergedImages, currentPage]);

  // Optimized image loading with better error handling
  const loadImage = useCallback((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image loading timeout: ${url}`));
      }, 8000); // Reduced timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Image loading error:', error, 'URL:', url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      try {
        const imageUrl = new URL(url, window.location.origin);
        const currentOrigin = new URL(window.location.origin);
        
        if (imageUrl.origin !== currentOrigin.origin) {
          img.crossOrigin = "anonymous";
        }
      } catch (e) {
        console.warn('URL parsing failed, assuming same origin:', url);
      }
      
      img.src = url;
    });
  }, []);

  const loadImageWithFetch = useCallback(async (url) => {
    try {
      return await loadImage(url);
    } catch (error) {
      console.warn('Normal image loading failed, trying fetch approach:', error);
      
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Failed to load image from blob: ${url}`));
          };
          img.src = objectUrl;
        });
      } catch (fetchError) {
        throw new Error(`All loading methods failed for: ${url} - ${fetchError.message}`);
      }
    }
  }, [loadImage]);

  // Batch processing for image merging
  const mergeImagesInBatches = useCallback(async (imageUrls) => {
    if (imageUrls.length === 0) return [];

    const combinedImages = [];
    setMergingProgress({ current: 0, total: Math.ceil(imageUrls.length / 2) });

    try {
      // Keep the first image as standalone
      combinedImages.push(imageUrls[0]);

      const combineTwoImages = async (url1, url2) => {
        try {
          const [img1, img2] = await Promise.all([
            loadImageWithFetch(url1),
            loadImageWithFetch(url2),
          ]);

          return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = img1.width + img2.width;
            canvas.height = Math.max(img1.height, img2.height);

            context.drawImage(img1, 0, 0);
            context.drawImage(img2, img1.width, 0);

            canvas.toBlob((blob) => {
              if (blob) {
                const mergedFile = new File([blob], `merged_${Date.now()}.png`, {
                  type: "image/png",
                });
                resolve(URL.createObjectURL(mergedFile));
              } else {
                reject(new Error("Canvas toBlob failed"));
              }
            }, "image/png");
          });
        } catch (error) {
          console.error('Error combining images:', error);
          throw error;
        }
      };

      // Process in smaller batches to avoid blocking UI
      for (let i = 1; i < imageUrls.length; i += MERGE_BATCH_SIZE) {
        const batchEnd = Math.min(i + MERGE_BATCH_SIZE, imageUrls.length);
        const batchPromises = [];

        for (let j = i; j < batchEnd; j += 2) {
          if (j + 1 < imageUrls.length) {
            batchPromises.push(
              combineTwoImages(imageUrls[j], imageUrls[j + 1])
                .then(merged => merged)
                .catch(() => [imageUrls[j], imageUrls[j + 1]]) // Fallback to individual images
            );
          } else {
            batchPromises.push(Promise.resolve(imageUrls[j]));
          }
        }

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            if (Array.isArray(result.value)) {
              combinedImages.push(...result.value);
            } else {
              combinedImages.push(result.value);
            }
          }
        });

        // Update progress
        setMergingProgress(prev => ({
          ...prev,
          current: Math.floor((i + MERGE_BATCH_SIZE - 1) / 2)
        }));

        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      return combinedImages;
    } catch (error) {
      console.error('Error in mergeImagesInBatches:', error);
      return imageUrls; // Fallback to original URLs
    }
  }, [loadImageWithFetch]);

  // Reset pagination when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setMergedImages([]);
      setImageLoaded({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editionId) {
      dispatch(getLibraryImages(editionId));
    }
  }, [isOpen, editionId, dispatch]);

  useEffect(() => {
    if (libraryError) {
      toast({
        title: "Error loading images",
        description: libraryError,
        status: "error",
        duration: 3000,
      });
    }
  }, [libraryError, toast]);

  useEffect(() => {
    if (libraryUploadError) {
      toast({
        title: "Error uploading image",
        description: libraryUploadError,
        status: "error",
        duration: 3000,
      });
    }
  }, [libraryUploadError, toast]);

  // Process images when library data changes
  useEffect(() => {
    if (libraryImages && libraryImages.length > 0) {
      if (mergeImages) {
        const defaultImages = libraryImages
          .filter((img) => img.isDefault)
          .map((img) => img.imageUrl);
        const nonDefaultImages = libraryImages
          .filter((img) => !img.isDefault)
          .map((img) => img.imageUrl);

        if (defaultImages.length > 0) {
          setIsMerging(true);
          mergeImagesInBatches(defaultImages)
            .then((merged) => {
              setMergedImages([...nonDefaultImages, ...merged]);
            })
            .finally(() => {
              setIsMerging(false);
              setMergingProgress({ current: 0, total: 0 });
            });
        } else {
          setMergedImages(nonDefaultImages);
        }
      } else {
        setMergedImages(libraryImages.map((img) => img.imageUrl));
      }
    }
  }, [libraryImages, mergeImages, mergeImagesInBatches]);

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setImageSizeError(
          "File size exceeds the 5MB limit. Select a smaller file."
        );
      } else {
        setImageSizeError("");
      }
      setSelectedFile(file);
      event.target.value = null;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      const key = `library/${editionId}/${selectedFile.name}`;
      const content_type = selectedFile.type;
      await dispatch(
        uploadLibraryImage(key, content_type, selectedFile, editionId)
      );
      setSelectedFile(null);
      toast({
        title: "Image uploaded successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error uploading image",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeselectFile = () => {
    setSelectedFile(null);
    setImageSizeError("");
  };

  const handleImageClick = (image) => {
    onImageSelect(image);
    onClose();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Clear loaded states for new page to show skeletons initially
    setImageLoaded({});
  };

  const renderImage = (image, index) => {
    const globalIndex = paginationData.startIndex + index;
    
    return (
      <Box key={globalIndex} boxSize="25%" maxW="200px" position="relative">
        <Skeleton
          boxSize="100%"
          isLoaded={!!imageLoaded[image]}
          borderRadius="md"
        >
          <ChakraImage
            src={image}
            alt={`Image ${globalIndex + 1}`}
            boxSize="100%"
            objectFit="contain"
            borderRadius="md"
            maxH="200px"
            minH="200px"
            minW="200px"
            objectPosition="center center"
            border="2px solid #e5e5e5"
            onLoad={() =>
              setImageLoaded((prev) => ({ ...prev, [image]: true }))
            }
            onClick={() => handleImageClick(image)}
            _hover={{
              cursor: "pointer",
              transform: "scale(1.05)",
              transition: "transform 0.2s ease-in-out",
              boxShadow: "lg",
            }}
            loading="lazy" // Enable native lazy loading
          />
        </Skeleton>
      </Box>
    );
  };

  const renderPagination = () => {
    if (paginationData.totalPages <= 1) return null;

    return (
      <HStack spacing={2} justify="center" mt={4}>
        <IconButton
          aria-label="Previous page"
          icon={<FaChevronLeft />}
          size="sm"
          isDisabled={!paginationData.hasPrevPage}
          onClick={() => handlePageChange(currentPage - 1)}
        />
        
        <Text fontSize="sm" color="gray.600">
          Page {currentPage} of {paginationData.totalPages}
        </Text>
        
        <IconButton
          aria-label="Next page"
          icon={<FaChevronRight />}
          size="sm"
          isDisabled={!paginationData.hasNextPage}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </HStack>
    );
  };

  return (
    <Modal mx="2" size="6xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg" lineHeight="2.5rem">
          Choose Image from Library
          {paginationData.totalItems > 0 && (
            <Text fontSize="sm" color="gray.500" fontWeight="normal">
              ({paginationData.totalItems} images total)
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Upload Box */}
          <Box mb={4}>
            <Flex
              align="center"
              gap={4}
              border="1px dashed #CBD5E0"
              borderRadius="md"
              p={4}
              justifyContent="space-between"
              backgroundColor="#F7FAFC"
              w="100%"
            >
              {selectedFile ? (
                <Flex
                  w="100%"
                  mt={3}
                  align="center"
                  justifyContent="space-between"
                >
                  <Flex align="center" gap={3}>
                    <ChakraImage
                      src={URL.createObjectURL(selectedFile)}
                      alt="Upload preview"
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Text fontSize="sm" color="gray.600">
                      Selected File: {selectedFile.name}
                    </Text>
                  </Flex>
                  <Box>
                    <Flex justify="flex-end" align="center" gap={2}>
                      <Button
                        size="md"
                        colorScheme="teal"
                        onClick={handleFileUpload}
                        isDisabled={!!imageSizeError || libraryUploadLoading}
                        isLoading={libraryUploadLoading}
                      >
                        Upload
                      </Button>
                      <IconButton
                        aria-label="Deselect file"
                        icon={<FaTimes />}
                        size="sm"
                        colorScheme="red"
                        onClick={handleDeselectFile}
                        isDisabled={libraryUploadLoading}
                      />
                    </Flex>
                    {imageSizeError && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {imageSizeError}
                      </Text>
                    )}
                  </Box>
                </Flex>
              ) : (
                <Flex
                  w="100%"
                  mt={3}
                  align="center"
                  justifyContent="space-between"
                >
                  <Flex align="center" gap={3}>
                    <FiImage size={24} color="#4A5568" />
                    <Text color="#4A5568">Select an image to upload</Text>
                  </Flex>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelection}
                    display="none"
                    id="file-upload"
                    disabled={libraryUploadLoading}
                  />
                  <Button
                    as="label"
                    htmlFor="file-upload"
                    size="sm"
                    leftIcon={<FaUpload />}
                    colorScheme="teal"
                    variant="outline"
                    isDisabled={libraryUploadLoading}
                  >
                    Browse
                  </Button>
                </Flex>
              )}
            </Flex>
          </Box>

          {/* Loading States */}
          {libraryLoading ? (
            <Flex justifyContent="center" alignItems="center" minHeight="60vh">
              <VStack spacing={4}>
                <Spinner size="xl" />
                <Text color="gray.500">Loading library images...</Text>
              </VStack>
            </Flex>
          ) : isMerging ? (
            <Flex justifyContent="center" alignItems="center" minHeight="60vh">
              <VStack spacing={4}>
                <Spinner size="xl" />
                <Text color="gray.500">
                  Merging images... ({mergingProgress.current}/{mergingProgress.total})
                </Text>
              </VStack>
            </Flex>
          ) : paginationData.currentPageItems.length > 0 ? (
            <>
              {/* Library Images Grid */}
              <Flex
                wrap="wrap"
                justifyContent="center"
                gap={4}
                mt={4}
                minHeight="60vh"
                maxW="860px"
                mx="auto"
              >
                {paginationData.currentPageItems.map((image, index) => 
                  renderImage(image, index)
                )}
              </Flex>
              
              {/* Pagination Controls */}
              {renderPagination()}
            </>
          ) : (
            <Flex justifyContent="center" alignItems="center" minHeight="60vh">
              <Text color="gray.500">No images found in library</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryImageSelector;