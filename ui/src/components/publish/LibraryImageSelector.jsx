import React, { useEffect, useState, useRef } from "react";
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
import { getLibraryImages, uploadLibraryImage } from "@/redux/publish/publishActions";

const LibraryImageSelector = ({ isOpen, onClose, editionId, onImageSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSizeError, setImageSizeError] = useState("");
  const [imageLoaded, setImageLoaded] = useState({});
  const [allImages, setAllImages] = useState([]);

  const dispatch = useDispatch();
  const toast = useToast();
  const { libraryImages, libraryLoading, libraryError, libraryUploadLoading, libraryUploadError } = useSelector((state) => state.publish);
  const lastFetchedEdition = useRef(null);

  // Fetch images
  useEffect(() => {
    if (isOpen && editionId && lastFetchedEdition.current !== editionId) {
      dispatch(getLibraryImages(editionId));
      lastFetchedEdition.current = editionId;
    }
  }, [isOpen, editionId, dispatch]);

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

  useEffect(() => {
    if (libraryImages && editionId) {
      setAllImages(libraryImages);
    }
  }, [libraryImages, editionId]);

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
      const key = `library/${editionId}/${selectedFile.name}`;
      const content_type = selectedFile.type;
      await dispatch(uploadLibraryImage(key, content_type, selectedFile, editionId));
      setSelectedFile(null);
      toast({ title: "Image uploaded successfully", status: "success", duration: 3000 });
    } catch (error) {
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
    <Box key={index} boxSize="25%" maxW="200px" position="relative">
      <Skeleton boxSize="100%" isLoaded={!!imageLoaded[image]} borderRadius="md">
        <ChakraImage
          src={image}
          alt={`Image ${index + 1}`}
          boxSize="100%"
          objectFit="contain"
          borderRadius="md"
          maxH="200px"
          minH="200px"
          minW="200px"
          border="2px solid #e5e5e5"
          onLoad={() => setImageLoaded((prev) => ({ ...prev, [image]: true }))}
          onClick={() => handleImageClick(image)}
          _hover={{
            cursor: "pointer",
            transform: "scale(1.05)",
            transition: "transform 0.2s ease-in-out",
            boxShadow: "lg",
          }}
          loading="lazy"
        />
      </Skeleton>
    </Box>
  );

  return (
    <Modal mx="2" size="6xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg">
          Choose Image from Library
          {allImages.length > 0 && (
            <Text fontSize="sm" color="gray.500">({allImages.length} images)</Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
            <Flex wrap="wrap" justifyContent="center" gap={4} mt={4} minHeight="60vh" maxW="860px" mx="auto">
              {allImages.map((image, index) => renderImage(image, index))}
            </Flex>
          ) : (
            <Flex justifyContent="center" alignItems="center" minHeight="60vh">
              <Text color="gray.500">No images found</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryImageSelector;
