import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Flex,
  Input,
  Box,
  Progress,
  Button,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { uploadLibraryImage } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";

const LibraryModal = ({
  isOpen,
  onClose,
  editionId,
  handleLibraryImage,
  libraryImages,
  setLibraryImages,
}) => {
  const [uploads, setUploads] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const libraryImageProgress = useSelector(
    (s) => s.publish?.libraryImageProgress
  );

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      event.target.value = null;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const uploadId = Date.now();
    const newUpload = { id: uploadId, file: selectedFile, progress: 0 };
    setUploads((prevUploads) => [...prevUploads, newUpload]);
    let key = `test/image/${selectedFile.name}`;
    let content_type = selectedFile.type;
    let url = await dispatch(
      uploadLibraryImage(key, content_type, selectedFile, editionId)
    );
    setLibraryImages(url);
    setSelectedFile(null);
  };

  const handleDeselectFile = () => {
    setSelectedFile(null);
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
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt={`Uploading`}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    Selected File: {selectedFile.name}
                  </Text>
                  <Flex align="center" gap={2}>
                    <Button
                      size="md"
                      colorScheme="teal"
                      onClick={handleFileUpload}
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
                  />
                  <Button
                    as="label"
                    htmlFor="file-upload"
                    size="sm"
                    leftIcon={<FaUpload />}
                    colorScheme="teal"
                    variant="outline"
                  >
                    Browse
                  </Button>
                </Flex>
              )}
            </Flex>
            <Box mb={4}>
              <Flex alignItems="center" gap={4}>
                <Progress
                  value={libraryImageProgress}
                  width="100%"
                  size="sm"
                  colorScheme="blue"
                  borderRadius="md"
                />
              </Flex>
            </Box>
          </Box>

          {/* Library Images */}
          <Flex wrap="wrap" justifyContent="space-between" gap={4} mt={4}>
            {libraryImages&&libraryImages.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Image ${index + 1}`}
                boxSize="30%" // Ensure three images fit per row
                objectFit="cover"
                borderRadius="md"
                onClick={() => handleLibraryImage(image)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.05)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            ))}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
