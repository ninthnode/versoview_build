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
  Progress,
  Button,
  Text,
  IconButton,
  Skeleton,
  Spinner
} from "@chakra-ui/react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { uploadLibraryImage } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";
import useLibraryImages from "@/hooks/useLibraryImages"; // Import our custom hook
import { useToast } from "@chakra-ui/react";

const LibraryModal = ({ 
  isOpen, 
  onClose, 
  editionId, 
  handleLibraryImage,
  onImageUpload = () => {} // Add callback for when an image is uploaded
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const toast = useToast();
  
  // Get full Redux state for debugging
  const reduxPublishState = useSelector(state => state.publish);
  
  // Debug Redux state
  useEffect(() => {
    console.log(`===== LibraryModal Redux State Debug =====`);
    console.log(`Full Redux publish state:`, reduxPublishState);
    console.log(`libraryImages in Redux:`, reduxPublishState.libraryImages);
    console.log(`fullLibraryImages in Redux:`, reduxPublishState.fullLibraryImages);
    console.log(`libraryImagesLoading:`, reduxPublishState.libraryImagesLoading);
    console.log(`libraryImagesError:`, reduxPublishState.libraryImagesError);
  }, [reduxPublishState]);
  
  const libraryImageProgress = useSelector(
    (s) => s.publish?.libraryImageProgress
  );
  const editionDetails = useSelector((s) => s.publish.singleEdition);

  // Debug logs for editionId
  console.log("LibraryModal: Received editionId:", editionId);
  console.log("LibraryModal: Edition details from Redux:", editionDetails);

  // Use our custom hook for reliable API calls
  const { 
    libraryImages: apiLibraryImages, 
    isLoading, 
    error, 
    refreshLibraryImages,
    addImageToLibrary
  } = useLibraryImages(editionId);
  
  // Debug log for API results
  useEffect(() => {
    console.log(`===== LibraryModal API Results =====`);
    console.log(`API library images: ${apiLibraryImages?.length || 0} images`);
    console.log(`API loading state: ${isLoading}`);
    console.log(`API error state: ${error || 'none'}`);
    
    // If we have API data, set it immediately
    if (apiLibraryImages && Array.isArray(apiLibraryImages)) {
      if (apiLibraryImages.length > 0) {
        console.log(`Setting library images from API (${apiLibraryImages.length} images)`);
        setLibraryImages(apiLibraryImages);
        setProcessedImages(true);
      } else {
        console.log(`API returned empty images array, will check edition details fallback`);
      }
    }
  }, [apiLibraryImages, isLoading, error]);

  const [imageSizeError, setImageSizeError] = useState("");
  const [imageLoaded, setImageLoaded] = useState({});
  const [libraryImages, setLibraryImages] = useState([]);
  const [processedImages, setProcessedImages] = useState(false);
  
  // Ensure API changes are properly reflected in the UI
  useEffect(() => {
    if (apiLibraryImages && apiLibraryImages.length > 0) {
      console.log(`****** LibraryModal: Received ${apiLibraryImages.length} images from API`);
      
      // Always update the library images with the latest from the API
      setLibraryImages(apiLibraryImages);
      
      // Log the first few images for debugging
      if (apiLibraryImages.length > 0) {
        console.log(`First image in library: ${apiLibraryImages[0]}`);
        if (apiLibraryImages.length > 1) {
          console.log(`Second image in library: ${apiLibraryImages[1]}`);
        }
      }
    } else {
      console.log(`****** LibraryModal: API returned empty library images array`);
    }
  }, [apiLibraryImages]);

  // Listen for Redux loading state changes
  useEffect(() => {
    console.log(`LibraryModal: Loading state changed to ${isLoading}`);
    if (isLoading) {
      console.log(`Loading library images...`);
    } else if (!isLoading && error) {
      console.error(`Error loading library images: ${error}`);
    } else if (!isLoading && !error) {
      console.log(`Library images loaded successfully`);
    }
  }, [isLoading, error]);

  // Add state to track loading time
  const [loadingDuration, setLoadingDuration] = useState(0);

  // Track loading duration
  useEffect(() => {
    let interval;
    if (isLoading) {
      // Reset counter when loading starts
      setLoadingDuration(0);
      
      // Start counting seconds
      interval = setInterval(() => {
        setLoadingDuration(prev => prev + 1);
      }, 1000);
    } else {
      // Reset counter when loading stops
      setLoadingDuration(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize)
        setImageSizeError(
          "File size exceeds the 5MB limit. Select a smaller file."
        );
      else setImageSizeError("");
      setSelectedFile(file);
      event.target.value = null;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    console.log(`===== UPLOADING FILE: ${selectedFile.name} =====`);
    console.log(`Edition ID: ${editionId}`);
    
    try {
      // Prepare file metadata
      let key = `test/image/${selectedFile.name}`;
      let content_type = selectedFile.type;
      
      // Show a temporary loading indicator
      setImageLoaded({}); // Reset image loading status
      
      // Upload the file
      console.log(`Dispatching uploadLibraryImage action`);
      const result = await dispatch(
        uploadLibraryImage(key, content_type, selectedFile, editionId)
      );
      
      console.log(`Upload result:`, result);
      
      // Clear file selection
      setSelectedFile(null);
      
      // Explicitly refresh the library images
      console.log(`Manually refreshing library images after upload`);
      refreshLibraryImages();
      
      // Show success toast if available
      if (typeof toast !== 'undefined') {
        toast({
          title: "Upload successful",
          description: "Your image has been added to the library",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Notify parent component about the upload
      onImageUpload(result);
      
    } catch (error) {
      console.error(`Error during file upload:`, error);
      
      // Show error toast if available
      if (typeof toast !== 'undefined') {
        toast({
          title: "Upload failed",
          description: error.message || "There was an error uploading your image",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeselectFile = () => {
    setSelectedFile(null);
  };

  const mergeImagesFromUrls = async (imageUrls) => {
    const combinedImages = [];

    if (imageUrls.length === 0) return combinedImages;

    // Keep the first image as a standalone
    combinedImages.push(imageUrls[0]);

    // Function to load an image
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Avoid CORS issues
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    };

    // Function to combine two images side by side
    const combineTwoImages = async (url1, url2) => {
      const [img1, img2] = await Promise.all([
        loadImage(url1),
        loadImage(url2),
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
            resolve(URL.createObjectURL(mergedFile)); // Convert File to URL for display
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, "image/png");
      });
    };

    // Process the remaining images in pairs (starting from the second image)
    for (let i = 1; i < imageUrls.length; i += 2) {
      if (i + 1 < imageUrls.length) {
        // Merge two images
        combinedImages.push(
          await combineTwoImages(imageUrls[i], imageUrls[i + 1])
        );
      } else {
        // Keep the last single image
        combinedImages.push(imageUrls[i]);
      }
    }
    return combinedImages;
  };

  // Process the images only if API didn't provide them
  useEffect(() => {
    console.log(`===== LibraryModal Fallback Processing =====`);
    console.log(`API images length: ${apiLibraryImages?.length || 0}`);
    console.log(`processed images flag: ${processedImages}`);
    console.log(`Edition details available: ${!!editionDetails}`);
    
    if ((!apiLibraryImages || apiLibraryImages.length === 0) && 
        editionDetails && 
        !processedImages) {
      console.log(`Using fallback: getting images from edition details`);
      let combinedImages = [];

      // Handle uploaded images - these are the more recent ones, so put them first
      if (editionDetails.uploadImages && editionDetails.uploadImages.length > 0) {
        console.log(`Found ${editionDetails.uploadImages.length} uploaded images, adding to top of list`);
        combinedImages = [...editionDetails.uploadImages]; // Start with uploaded images
      }

      // Handle library images - add these after the uploaded ones
      if (editionDetails.libraryImages && editionDetails.libraryImages.length > 0) {
        console.log(`Found ${editionDetails.libraryImages.length} library images`);
        
        // If there are library images, add them after the upload images
        combinedImages = [...combinedImages, ...editionDetails.libraryImages];
        console.log(`Setting ${combinedImages.length} combined images immediately`);
        setLibraryImages(combinedImages);
        
        // Then process merged images asynchronously if needed
        if (combinedImages.length > 0) {
          mergeImagesFromUrls(editionDetails.libraryImages)
            .then((mergedFiles) => {
              console.log(`Created ${mergedFiles.length} merged image files`);
              if (mergedFiles && mergedFiles.length > 0) {
                // Keep uploaded images at the top, then add merged images
                const uploadedImagesOnly = combinedImages.filter(img => 
                  editionDetails.uploadImages && editionDetails.uploadImages.includes(img));
                
                const updatedImages = [...uploadedImagesOnly, ...mergedFiles];
                console.log(`Setting ${updatedImages.length} final images after merging`);
                setLibraryImages(updatedImages);
              }
            })
            .catch(error => {
              console.error(`Error merging images: ${error.message}`);
            })
            .finally(() => {
              setProcessedImages(true);
            });
        } else {
          setProcessedImages(true);
        }
      } else {
        console.log(`No library images in edition details, using only uploaded images (${combinedImages.length})`);
        setLibraryImages(combinedImages);
        setProcessedImages(true);
      }
    } else if (processedImages) {
      console.log(`Images already processed, skipping fallback`);
    } else if (apiLibraryImages && apiLibraryImages.length > 0) {
      console.log(`Using API images instead of fallback`);
      setProcessedImages(true);
    }
  }, [editionDetails, apiLibraryImages, processedImages]);

  // Modified handleLibraryImageSelection to just handle manual selections
  const handleLibraryImageSelection = (imageUrl) => {
    console.log(`===== IMAGE SELECTED IN LIBRARY MODAL =====`);
    console.log(`Selected image URL: ${imageUrl}`);
    
    if (!imageUrl) {
      console.error(`No image URL provided to handleLibraryImageSelection`);
      return;
    }
    
    // First close the modal to improve user experience
    console.log(`Closing library modal`);
    onClose();
    
    // Then call the parent handler (slight delay to allow modal closing animation)
    setTimeout(() => {
      console.log(`Calling parent handleLibraryImage function with URL:`, imageUrl);
      handleLibraryImage(imageUrl);
      
      // Show toast if available
      if (typeof toast !== 'undefined') {
        toast({
          title: "Image selected",
          description: "Image has been added to your post",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }, 100);
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
                        isDisabled={imageSizeError === "" ? false : true}
                      >
                        Upload
                      </Button>
                      <IconButton
                        aria-label="Deselect file"
                        icon={<FaTimes />}
                        size="sm"
                        colorScheme="red"
                        onClick={handleDeselectFile}
                      />
                    </Flex>
                    {imageSizeError === ""
                      ? false
                      : true && <Text color="red.500">{imageSizeError}</Text>}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelection}
                    id="file-upload"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      as="span"
                      size="sm"
                      leftIcon={<FaUpload />}
                      colorScheme="teal"
                      cursor="pointer"
                    >
                      Browse Files
                    </Button>
                  </label>
                </Flex>
              )}
            </Flex>
            {libraryImageProgress > 0 && (
              <Progress
                value={libraryImageProgress}
                size="sm"
                colorScheme="teal"
                mt="2"
              />
            )}
          </Box>

          {/* Display loading indicator when fetching images */}
          {isLoading && (
            <Flex justify="center" align="center" my={10} direction="column">
              <Spinner size="xl" color="teal.500" mb={4} />
              <Text fontSize="lg" color="gray.600" mb={2}>
                Loading library images...
                {loadingDuration > 5 && ` (${loadingDuration}s)`}
              </Text>
              
              {/* Show retry button if loading takes too long */}
              {loadingDuration > 10 && (
                <Button 
                  colorScheme="teal" 
                  mt={4} 
                  onClick={() => {
                    console.log("Manual retry triggered");
                    refreshLibraryImages();
                  }}
                >
                  Retry Loading Images
                </Button>
              )}
            </Flex>
          )}

          {/* Display error message if any */}
          {error && (
            <Box bg="red.50" color="red.500" p={4} borderRadius="md" mb={4}>
              <Text>Error loading images: {error}</Text>
              <Button mt={2} size="sm" onClick={refreshLibraryImages}>
                Retry
              </Button>
            </Box>
          )}

          {/* Library Images */}
          {!isLoading && !error && (
            <Flex wrap="wrap" gap={4} justify="flex-start">
              {libraryImages.length > 0 ? (
                libraryImages.map((imgUrl, index) => (
                  <Box
                    key={index}
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                    overflow="hidden"
                    boxShadow="md"
                    position="relative"
                    cursor="pointer"
                    onClick={() => handleLibraryImageSelection(imgUrl)}
                    minW="200px"
                    maxW="200px"
                    height="200px"
                  >
                    {!imageLoaded[index] && (
                      <Skeleton height="200px" width="200px" />
                    )}
                    <ChakraImage
                      src={imgUrl}
                      alt={`Library image ${index}`}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      onLoad={() =>
                        setImageLoaded((prev) => ({ ...prev, [index]: true }))
                      }
                      style={{
                        display: imageLoaded[index] ? "block" : "none",
                      }}
                      crossOrigin="anonymous"
                    />
                  </Box>
                ))
              ) : (
                <Flex
                  w="100%"
                  justify="center"
                  align="center"
                  p={10}
                  bg="gray.50"
                  borderRadius="md"
                  direction="column"
                  gap={4}
                >
                  <FiImage size={48} color="#718096" />
                  <Text color="gray.500" fontSize="lg">
                    No images in library
                  </Text>
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Upload an image using the form above to add to your library
                  </Text>
                </Flex>
              )}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
