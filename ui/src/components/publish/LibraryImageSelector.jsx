import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  getLibraryImages,
  uploadLibraryImage,
} from "@/redux/publish/publishActions";

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

  const [isMerging, setIsMerging] = useState(false);

  const dispatch = useDispatch();
  const toast = useToast();
  const {
    libraryImages,
    libraryLoading,
    libraryError,
    libraryUploadLoading,
    libraryUploadError,
  } = useSelector((state) => state.publish);

// Fixed loadImage function with better error handling and CORS handling
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error(`Image loading timeout: ${url}`));
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.error('Image loading error:', error, 'URL:', url);
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    // Try loading without crossOrigin first (for same-origin images)
    // Only set crossOrigin if the image is from a different origin
    try {
      const imageUrl = new URL(url, window.location.origin);
      const currentOrigin = new URL(window.location.origin);
      
      if (imageUrl.origin !== currentOrigin.origin) {
        img.crossOrigin = "anonymous";
      }
    } catch (e) {
      // If URL parsing fails, assume it's a relative URL (same origin)
      console.warn('URL parsing failed, assuming same origin:', url);
    }
    
    img.src = url;
  });
};

// Alternative approach - if CORS is still an issue, use fetch with proxy
const loadImageWithFetch = async (url) => {
  try {
    // First try to load normally
    return await loadImage(url);
  } catch (error) {
    console.warn('Normal image loading failed, trying fetch approach:', error);
    
    // Fallback: use fetch to get the image as blob, then create object URL
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
          // Clean up the object URL after loading
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
};

// Updated mergeImagesFromUrls function with better error handling
const mergeImagesFromUrls = async (imageUrls) => {
  const combinedImages = [];

  if (imageUrls.length === 0) return combinedImages;

  try {
    // Keep the first image as a standalone
    combinedImages.push(imageUrls[0]);

    // Function to combine two images side by side
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

          // Draw both images side by side
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

    // Process the remaining images in pairs (starting from the second image)
    for (let i = 1; i < imageUrls.length; i += 2) {
      try {
        if (i + 1 < imageUrls.length) {
          // Merge two images
          const mergedImage = await combineTwoImages(imageUrls[i], imageUrls[i + 1]);
          combinedImages.push(mergedImage);
        } else {
          // Keep the last single image
          combinedImages.push(imageUrls[i]);
        }
      } catch (error) {
        console.error(`Error processing images at index ${i}:`, error);
        // Continue with the remaining images even if one pair fails
        if (i + 1 < imageUrls.length) {
          // Add both images individually if merging fails
          combinedImages.push(imageUrls[i], imageUrls[i + 1]);
        } else {
          combinedImages.push(imageUrls[i]);
        }
      }
    }
    
    return combinedImages;
  } catch (error) {
    console.error('Error in mergeImagesFromUrls:', error);
    // Fallback: return original URLs if merging completely fails
    return imageUrls;
  }
};
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

  useEffect(() => {
    if (libraryImages && libraryImages.length > 0) {
      if (mergeImages) {
        const defaultImages = libraryImages
          .filter((img) => img.isDefault)
          .map((img) => img.imageUrl);
        const nonDefaultImages = libraryImages
          .filter((img) => !img.isDefault)
          .map((img) => img.imageUrl);

        setIsMerging(true);
        mergeImagesFromUrls(defaultImages)
          .then((merged) => {
            setMergedImages([...nonDefaultImages, ...merged]);
          })
          .finally(() => {
            setIsMerging(false);
          });
      } else {
        setMergedImages(libraryImages.map((img) => img.imageUrl));
      }
    }
  }, [libraryImages]);

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
      let resp = await dispatch(
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
  };

  const handleImageClick = (image) => {
    onImageSelect(image);
    onClose();
  };

  const renderImage = (image, index) => {
    return (
      <Box key={index} boxSize="25%" maxW="200px" position="relative">
        <Skeleton
          boxSize="100%"
          isLoaded={!!imageLoaded[image]}
          borderRadius="md"
        >
          <ChakraImage
            src={image}
            alt={`Image ${index + 1}`}
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
          />
        </Skeleton>
      </Box>
    );
  };

  return (
    <Modal mx="2" size="6xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg" lineHeight="2.5rem">
          Choose Image from Library
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
                  <Text fontSize="sm" color="gray.600">
                    <ChakraImage
                      src={URL.createObjectURL(selectedFile)}
                      alt={`Uploading`}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    Selected File: {selectedFile.name}
                  </Text>
                  <Box>
                    <Flex justify="flex-end" align="center" w={"100%"} gap={2}>
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
                      <Text color="red.500">{imageSizeError}</Text>
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

          {/* Library Images Grid */}
          {libraryLoading || isMerging ? (
            <Flex justifyContent="center" alignItems="center" minHeight="80vh">
              <Spinner size="xl" />
            </Flex>
          ) : mergedImages && mergedImages.length > 0 ? (
            <Flex
              wrap="wrap"
              justifyContent="center"
              gap={4}
              mt={4}
              minHeight="80vh"
              maxW="860px"
              mx="auto"
            >
              {mergedImages.map((image, index) => renderImage(image, index))}
            </Flex>
          ) : (
            <Flex justifyContent="center" alignItems="center" minHeight="80vh">
              <Text color="gray.500">No images found in library</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryImageSelector;
