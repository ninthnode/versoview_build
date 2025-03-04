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
  Skeleton
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
  const [imageSizeError, setImageSizeError] = useState("");
  
  // State to track loading of images
  const [imageLoaded, setImageLoaded] = useState({});
  const [mergedFiles, setMergedFiles] = useState([]);

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

  const mergeImagesFromUrls = async (imageUrls) => {
    const combinedImages = [];
  
    if (imageUrls.length === 0) return combinedImages;
  
    // Keep the first image as a standalone
    combinedImages.push(imageUrls[0]);
  
    // Function to load an image from a URL
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
      const [img1, img2] = await Promise.all([loadImage(url1), loadImage(url2)]);
  
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
            const mergedFile = new File(
              [blob],
              `merged_${Date.now()}.png`,
              { type: "image/png" }
            );
            resolve(URL.createObjectURL(mergedFile)); // Convert File to Blob URL
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, "image/png");
      });
    };
  
    // Process the remaining images in pairs (starting from the second image)
    for (let i = 1; i < imageUrls.length; i += 2) {
      if (i + 1 < imageUrls.length) {
        // Merge and process two images
        const mergedBlobUrl = await combineTwoImages(imageUrls[i], imageUrls[i + 1]);
        const processedImage = await processImage(mergedBlobUrl);
        combinedImages.push(processedImage);
      } else {
        // Process last single image separately
        const processedImage = await processImage(imageUrls[i]);
        combinedImages.push(processedImage);
      }
    }
  
    return combinedImages;
  };
  
  // Function to process an image: Resize, maintain aspect ratio, and add white background
  const processImage = (imageDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 1440;
        const targetHeight = 820;
  
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        canvas.width = targetWidth;
        canvas.height = targetHeight;
  
        // Fill background with white
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
  
        // Calculate aspect ratio to fit within canvas
        let scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        let newWidth = img.width * scale;
        let newHeight = img.height * scale;
  
        let xOffset = (targetWidth - newWidth) / 2;
        let yOffset = (targetHeight - newHeight) / 2;
  
        // Draw image on canvas
        ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
  
        // Convert canvas to data URL
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageDataUrl;
    });
  };
  useEffect(() => {
    if(libraryImages)
      mergeImagesFromUrls(libraryImages).then((mergedFiless) => {
      setMergedFiles(mergedFiless);
    })
  }, [libraryImages])
  
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
                    {imageSizeError === "" ? false : true && (
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
          <Flex wrap="wrap" justifyContent="space-between" gap={4} mt={4}>
            {mergedFiles &&mergedFiles.length > 0 &&
              mergedFiles.map((image, index) => (
                <Box key={index} boxSize="30%" position="relative">
                  {/* Show Skeleton (Shimmer) until the image loads */}
                  <Skeleton
                    isLoaded={!!imageLoaded[image]}
                    boxSize="100%"
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryModal;
