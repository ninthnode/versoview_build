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
  Skeleton,Spinner
} from "@chakra-ui/react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { uploadLibraryImage } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";

const LibraryModal = ({ isOpen, onClose, editionId, handleLibraryImage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const libraryImageProgress = useSelector(
    (s) => s.publish?.libraryImageProgress
  );
  const editionDetails = useSelector((s) => s.publish.singleEdition);

  const [imageSizeError, setImageSizeError] = useState("");

  const [imageLoaded, setImageLoaded] = useState({});

  const [libraryImages, setLibraryImages] = useState([]);

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
    let key = `test/image/${selectedFile.name}`;
    let content_type = selectedFile.type;
    await dispatch(
      uploadLibraryImage(key, content_type, selectedFile, editionId)
    );
    setSelectedFile(null);
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
  useEffect(() => {
    if (editionDetails) {
      let combinedImages = [];

      if (editionDetails.uploadImages) {
        combinedImages = [...editionDetails.uploadImages]; // Start with uploaded images
      }

      if (editionDetails.libraryImages) {
        mergeImagesFromUrls(editionDetails.libraryImages).then(
          (mergedFiless) => {
            combinedImages = [...combinedImages, ...mergedFiless]; // Append merged library images
            setLibraryImages(combinedImages);
          }
        );
      } else {
        setLibraryImages(combinedImages); // Set only uploaded images if no library images exist
      }
    }
  }, [editionDetails, selectedFile]);

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

          {/* Library Images with Shimmer Effect */}
          {!libraryImages || libraryImages.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" minHeight="80vh">
              <Spinner size="xl" />
            </Flex>
          ) : (
            <Flex
              wrap="wrap"
              justifyContent="flex-start"
              gap={4}
              mt={4}
              minHeight={"80vh"}
            >
              {libraryImages.map((image, index) => (
                <Box key={index} boxSize="30%" position="relative">
                  <Skeleton
                    boxSize="100%"
                    isLoaded={!!imageLoaded[image]}
                    borderRadius="md"
                  >
                    <ChakraImage
                      src={image}
                      alt={`Image ${index + 1}`}
                      boxSize="100%"
                      objectFit="cover"
                      borderRadius="md"
                      onLoad={() =>
                        setImageLoaded((prev) => ({ ...prev, [image]: true }))
                      }
                      onClick={() => handleLibraryImage(image)}
                      _hover={{
                        cursor: "pointer",
                        transform: "scale(1.05)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    />
                  </Skeleton>
                </Box>
              ))}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
