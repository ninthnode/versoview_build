import React, { useEffect, useState, useRef, useMemo } from "react";
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
} from "@chakra-ui/react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { getLibraryImages, uploadPostImage, addTempLibraryImage } from "@/redux/publish/publishActions";

const LibraryImageSelector = ({ isOpen, onClose, editionId, postId, onImageSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSizeError, setImageSizeError] = useState("");
  const [imageLoaded, setImageLoaded] = useState({});

  const dispatch = useDispatch();
  const toast = useToast();
  const { libraryImages, libraryLoading, libraryError, libraryUploadLoading, libraryUploadError, tempLibraryImages } = useSelector((state) => {
    console.log('LibraryImageSelector useSelector called with tempLibraryImages:', state.publish.tempLibraryImages?.length || 0);
    return state.publish;
  });
  const lastFetchedEdition = useRef(null);
  
  // Use useMemo instead of state for allImages to ensure it's recalculated on every dependency change
  const allImages = useMemo(() => {
    let combinedImages = [];
    
    console.log('useMemo: Combining images - libraryImages:', libraryImages?.length || 0, 'tempLibraryImages:', tempLibraryImages?.length || 0);
    
    // Add images from server (if postId or editionId exists and we have library images)
    if (libraryImages && (postId || editionId)) {
      combinedImages = [...combinedImages, ...libraryImages];
      console.log('useMemo: Added library images:', libraryImages.length);
    }
    
    // Add temporary images from Redux (only if no postId or editionId)
    if (tempLibraryImages && tempLibraryImages.length > 0 && !postId && !editionId) {
      combinedImages = [...combinedImages, ...tempLibraryImages];
      console.log('useMemo: Added temp library images:', tempLibraryImages.length);
    }
    
    // Remove duplicates
    const uniqueImages = [...new Set(combinedImages)];
    console.log('useMemo: Final combined images count:', uniqueImages.length);
    return uniqueImages;
  }, [libraryImages, tempLibraryImages, postId, editionId]);
  
  // Debug logs for Redux state and component re-renders
  useEffect(() => {
    const componentType = postId ? 'Normal Post' : editionId ? 'Edition Post' : 'Temporary';
    console.log(`LibraryImageSelector (${componentType}) Redux State Update:`, {
      libraryImages: libraryImages?.length || 0,
      tempLibraryImages: tempLibraryImages?.length || 0,
      allImagesCount: allImages?.length || 0,
      postId,
      editionId
    });
  }, [libraryImages, tempLibraryImages, postId, editionId, allImages]);

  // Fetch images
  useEffect(() => {
    if (isOpen) {
      const fetchKey = postId || editionId;
      console.log('LibraryImageSelector11', 'postId:', postId, 'editionId:', editionId);
      if (fetchKey && lastFetchedEdition.current !== fetchKey) {
        console.log('Fetching library images for:', { postId, editionId });
        dispatch(getLibraryImages(postId, editionId));
        lastFetchedEdition.current = fetchKey;
      }
    }
    // Note: If no postId or editionId, useMemo will handle empty state
  }, [isOpen, postId, editionId, dispatch]);

  useEffect(() => {
    if (libraryError) {
      toast({ title: "Error loading images", description: libraryError, status: "error", duration: 3000 });
    }
  }, [libraryError, toast]);

  useEffect(() => {
    if (libraryUploadError) {
      toast({ title: "Error uploading image", description: libraryUploadError, status: "error", duration: 3000 });
    }
  }, [libraryUploadError, toast]);

  // Remove the useEffect since we're now using useMemo

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageSizeError("File size exceeds 5MB.");
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
      // Create a unique key for the upload
      const uploadId = postId || `temp_${Date.now()}`;
      const key = `post/${uploadId}/${selectedFile.name}`;
      const content_type = selectedFile.type;
      
      // Upload to S3 only (don't save to database yet)
      const signedUrlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/s3/signed_url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, content_type })
        }
      );
      
      const signedUrlData = await signedUrlResponse.json();
      
      // Upload file to S3
      await fetch(signedUrlData.data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': content_type },
        body: selectedFile
      });
      
      // Get the final URL
      const signedUrl = new URL(signedUrlData.data.signedUrl);
      const imageUrl = `${signedUrl.protocol}//${signedUrl.host}${signedUrl.pathname}`;
      
      // Handle different scenarios based on available IDs
      if (postId) {
        // Normal post - save to database with postId
        console.log('Uploading to database for postId:', postId);
        await dispatch(uploadPostImage(key, content_type, selectedFile, postId, editionId));
        dispatch(getLibraryImages(postId, editionId));
      } else if (editionId) {
        // Edition post - save to database with editionId
        console.log('Uploading to database for editionId:', editionId);
        await dispatch(uploadPostImage(key, content_type, selectedFile, null, editionId));
        dispatch(getLibraryImages(null, editionId));
      } else {
        // No postId or editionId - use temporary storage
        console.log('Adding temp library image:', imageUrl);
        dispatch(addTempLibraryImage(imageUrl));
        console.log('Dispatched addTempLibraryImage action');
      }
      
      setSelectedFile(null);
      toast({ title: "Image uploaded successfully", status: "success", duration: 3000 });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload error", description: error.message, status: "error", duration: 3000 });
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

  const renderImage = (image, index) => (
    <Box 
      key={index} 
      w={{ base: "150px", md: "200px" }} 
      h={{ base: "150px", md: "200px" }} 
      position="relative"
      flexShrink={0}
    >
      <Skeleton 
        w="100%" 
        h="100%" 
        isLoaded={!!imageLoaded[image]} 
        borderRadius="md"
      >
        <ChakraImage
          src={image}
          alt={`Library image ${index + 1}`}
          w="100%"
          h="100%"
          objectFit="cover"
          borderRadius="md"
          border="2px solid #e5e5e5"
          onLoad={() => setImageLoaded((prev) => ({ ...prev, [image]: true }))}
          onClick={() => handleImageClick(image)}
          _hover={{
            cursor: "pointer",
            transform: "scale(1.05)",
            transition: "transform 0.2s ease-in-out",
            boxShadow: "lg",
            borderColor: "blue.400",
          }}
          _focus={{
            outline: "2px solid",
            outlineColor: "blue.500",
          }}
          loading="lazy"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleImageClick(image);
            }
          }}
        />
      </Skeleton>
    </Box>
  );

  return (
    <Modal mx="2" size={{ base: "full", md: "6xl" }} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxH={{ base: "100vh", md: "90vh" }} overflow="hidden">
        <ModalHeader fontSize={{ base: "md", md: "lg" }} pb={2}>
          Choose Image from Library
          {allImages.length > 0 && (
            <Text fontSize="sm" color="gray.500">({allImages.length} images available)</Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflow="auto">
          <Box mb={4}>
              <Flex align="center" gap={4} border="1px dashed #CBD5E0" borderRadius="md" p={4} backgroundColor="#F7FAFC" w="100%">
              {selectedFile ? (
                <Flex w="100%" mt={3} align="center" justifyContent="space-between">
                  <Flex align="center" gap={3}>
                    <ChakraImage src={URL.createObjectURL(selectedFile)} alt="Preview" boxSize="80px" objectFit="cover" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">Selected: {selectedFile.name}</Text>
                  </Flex>
                  <Box>
                    <Flex gap={2}>
                      <Button size="md" colorScheme="teal" onClick={handleFileUpload} isDisabled={!!imageSizeError || libraryUploadLoading} isLoading={libraryUploadLoading}>
                        Upload
                      </Button>
                      <IconButton aria-label="Deselect" icon={<FaTimes />} size="sm" colorScheme="red" onClick={handleDeselectFile} isDisabled={libraryUploadLoading} />
                    </Flex>
                    {imageSizeError && <Text color="red.500" fontSize="sm" mt={1}>{imageSizeError}</Text>}
                  </Box>
                </Flex>
              ) : (
                <Flex w="100%" mt={3} align="center" justifyContent="space-between">
                  <Flex align="center" gap={3}>
                    <FiImage size={24} color="#4A5568" />
                    <Text color="#4A5568">Select an image to upload</Text>
                  </Flex>
                  <Input type="file" accept="image/*" onChange={handleFileSelection} display="none" id="file-upload" disabled={libraryUploadLoading} />
                  <Button as="label" htmlFor="file-upload" size="sm" leftIcon={<FaUpload />} colorScheme="teal" variant="outline" isDisabled={libraryUploadLoading}>
                    Browse
                  </Button>
                </Flex>
              )}
            </Flex>
          </Box>

          {libraryLoading ? (
            <Flex justify="center" alignItems="center" minHeight="60vh">
              <VStack spacing={4}><Spinner size="xl" /><Text color="gray.500">Loading images...</Text></VStack>
            </Flex>
          ) : allImages.length > 0 ? (
            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Select an image from your library (includes merged images and post images)
              </Text>
              <Flex 
                wrap="wrap" 
                justifyContent={{ base: "center", md: "flex-start" }} 
                gap={{ base: 2, md: 4 }} 
                mt={4} 
                minHeight={{ base: "50vh", md: "60vh" }}
              >
                {allImages.map((image, index) => renderImage(image, index))}
              </Flex>
            </Box>
          ) : (
            <Flex justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
              <Text color="gray.500" mb={2}>No images in library yet</Text>
              <Text fontSize="sm" color="gray.400">Upload an image above to get started</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryImageSelector;
