import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Text,
  Select,
  Spinner,
} from "@chakra-ui/react";
import DOMPurify from "dompurify";
import dynamic from "next/dynamic";
import { useToast } from "@chakra-ui/react";
import ImageCropper from "@/components/Image-cropper/ImageCropper";
import useDeviceType from "@/components/useDeviceType";
import genres from "@/static-data/genres";
import LibraryImageSelector from "../publish/LibraryImageSelector";
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

const PostForm = ({
  formData,
  setFormData,
  uploadedImage,
  setUploadedImage,
  croppedImage,
  setCroppedImage,
  selectedSection,
  setSelectedSection,
  selectedSubSection,
  setSelectedSubSection,
  editionDetails,
  handleSubmit,
  postLoading,
  isEditMode,
  handlePreview,
}) => {
  const deviceType = useDeviceType();
  const toast = useToast();
  const [imageSizeError, setImageSizeError] = useState("");
  const [libraryImages, setLibraryImages] = useState([]);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isLoadingFeatureImage, setIsLoadingFeatureImage] = useState(false);

  useEffect(() => {
    // Debug log to check editionDetails
    console.log("PostForm: editionDetails:", editionDetails);
    
    // Initialize library images if needed when edition changes
    if (editionDetails && editionDetails.libraryImages && !libraryImages.length) {
      console.log("Initializing library images from edition details");
      setLibraryImages(editionDetails.libraryImages || []);
    }
  }, [editionDetails]);

  const handleFileSelect = async (e) => {
    const maxSize = 5 * 1024 * 1024;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > maxSize) {
        setImageSizeError(
          "File size exceeds the 5MB limit. Select a smaller file."
        );
        setUploadedImage("");
        setCroppedImage("");
        return;
      }
      setImageSizeError("");
      const imageDataUrl = await readFile(file);
      const processedImage = await processImage(imageDataUrl);
      setUploadedImage(processedImage);
    }
  };

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
        let scale = Math.min(
          targetWidth / img.width,
          targetHeight / img.height
        );
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

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleTextBodyChange = (text) => {
    const sanitizedText = DOMPurify.sanitize(text);
    setFormData((prevFormData) => ({
      ...prevFormData,
      bodyRichText: sanitizedText,
    }));
  };

  const handlePreviewPage = () => {
    const { header, standFirst, credits, bodyRichText } = formData;

    if (!header) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mandatory * fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (uploadedImage ? !croppedImage : false) {
      toast({
        title: "Save The Image",
        description: "Save The Image After Cropping",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    handlePreview();
  };

const imageUrlToDataUrl = async (url) => {
  const proxiedUrl = "http://localhost:5001/image-proxy?url=" + encodeURIComponent(url);
  const response = await fetch(proxiedUrl, { mode: 'cors' }); // might fail due to CORS
  const blob = await response.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleLibraryImage = async (img) => {
    setIsLoadingFeatureImage(true)    
    try {
      if (!img) {
        console.error("No image data provided to handleLibraryImage");
        return;
      }
      
      // Clear any previous error
      setImageSizeError("");
      
      // Process image based on type
      if (isValidUrl(img)) {
        console.log("Processing as URL:", img);
        const imageDataUrl = await imageUrlToDataUrl(img);
        if (imageDataUrl) {
          console.log("Successfully converted to data URL");
          const processedImage = await processImage(imageDataUrl);
          console.log("Image processed, setting as uploaded image");
          setIsLoadingFeatureImage(false)    
          setUploadedImage(processedImage);
          // Make sure cropped image is cleared so user can crop the new image
          setCroppedImage(null);
        } else {
          console.error("Failed to convert URL to data URL:", img);
          toast({
            title: "Error",
            description: "Failed to load the selected image",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        console.log("Processing as data URL");
        const processedImage = await processImage(img);
        console.log("Image processed, setting as uploaded image");
        setUploadedImage(processedImage);
        // Make sure cropped image is cleared so user can crop the new image
        setCroppedImage(null);
      }
    } catch (error) {
      console.error("Error handling library image:", error);
      toast({
        title: "Error",
        description: "Failed to process the selected image",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box w={{ base: "100%", lg: "60%" }}>
      {/* Form Section */}
      <Stack spacing={4}>
        <Box w="100%">
          <Flex justifyContent="space-between" alignItems="center" px="4">
            <Text fontSize="sm">MAIN IMAGE</Text>
            <div>
              <Input
                visibility="hidden"
                id="files"
                type="file"
                accept="image/*"
                size="sm"
                mt={2}
                w={"10px"}
                onChange={handleFileSelect}
              />
              <Input
                visibility="hidden"
                id="cameras"
                type="file"
                accept="image/*"
                size="sm"
                mt={2}
                w={"10px"}
                onChange={handleFileSelect}
                capture="environment"
              />
              <label htmlFor="files" className="btn">
                UPLOAD IMAGE
              </label>
            </div>
          </Flex>
          <FormControl id="mainImage">
            <Box
              border="3px dashed #e2e8f0"
              width="360px"
              height="205px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              m="0 auto"
              position="relative"
              borderColor={
                imageSizeError !== ""
                  ? "red.500"
                  : croppedImage && uploadedImage
                  ? "#e2e8f0"
                  : uploadedImage
                  ? "green.500"
                  : "#e2e8f0"
              }
            >
              <ImageCropper
              isLoadingFeatureImage={isLoadingFeatureImage}
                croppedImage={croppedImage}
                uploadedImage={uploadedImage ||formData?.mainImageURL}
                onCropComplete={setCroppedImage}
                imageSizeError={imageSizeError}
                setCroppedImage={setCroppedImage}
                setUploadedImage={setUploadedImage}
                edition={editionDetails}
                handleLibraryImage={handleLibraryImage}
                libraryImages={libraryImages}
                setLibraryImages={setLibraryImages}
                setIsLibraryModalOpen={setIsLibraryModalOpen}
              />
            </Box>
          </FormControl>
          <Box p="0" mt="2">
            {deviceType === "phone" && (
              <Text
                p="0"
                fontSize="xs"
                color="textlight"
                lineHeight="4px"
              >
                *Want to upload a PDF? - Use Desktop Version
              </Text>
            )}
          </Box>
        </Box>
        <Box w="100%">
          <Flex mb="4" direction={{ base: "row", md: "column" }} gap={2}>
            <FormControl id="edition" mr={4}>
              <FormLabel fontSize="sm">Edition*</FormLabel>
              <Input
                size="sm"
                type="text"
                placeholder="The Green Room"
                value={editionDetails?.editionText || ""}
                isDisabled={true}
                maxLength={70}
                color="#000"
              />
            </FormControl>
            <FormControl id="section" mr={4}>
              <FormLabel fontSize="sm">SECTION</FormLabel>
              <Select
                size="sm"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select a section</option>
                {Object.keys(genres).map((genre) => (
                  <option key={genre} value={genre}>
                    {genres[genre].genre}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl id="subSection">
              <FormLabel fontSize="sm">SUB SECTION</FormLabel>
              <Select
                size="sm"
                value={selectedSubSection}
                onChange={(e) => setSelectedSubSection(e.target.value)}
                disabled={!selectedSection}
              >
                <option value="">Select a sub-section</option>
                {selectedSection &&
                  genres[selectedSection].subGenres.map((subGenre) => (
                    <option key={subGenre} value={subGenre}>
                      {subGenre}
                    </option>
                  ))}
              </Select>
            </FormControl>
          </Flex>
          <FormControl id="header" mb="4">
            <FormLabel fontSize="sm">HEADER*</FormLabel>
            <Input
              size="sm"
              type="text"
              placeholder="The Green Room"
              value={formData.header}
              maxLength={70}
              onChange={(e) =>
                setFormData({ ...formData, header: e.target.value })
              }
            />
          </FormControl>
          <FormControl id="standFirst" mb="4">
            <FormLabel fontSize="sm">STAND-FIRST</FormLabel>
            <Input
              size="sm"
              type="text"
              placeholder="Nature's colour palette helps lines this..."
              value={formData.standFirst}
              maxLength={150}
              onChange={(e) =>
                setFormData({ ...formData, standFirst: e.target.value })
              }
            />
          </FormControl>
          <FormControl id="credits" mb="4">
            <FormLabel fontSize="sm">CREDITS</FormLabel>
            <Input
              size="sm"
              type="text"
              placeholder="Suzy Tan & Hadaway Smythe"
              value={formData.credits}
              onChange={(e) =>
                setFormData({ ...formData, credits: e.target.value })
              }
            />
          </FormControl>
        </Box>

        <FormControl id="bodyRichText">
          <FormLabel fontSize="sm">BODY COPY</FormLabel>
          <RichTextEditor
            handleTextBodyChange={handleTextBodyChange}
            bodyRichText={formData.bodyRichText}
            initialValue={formData.bodyRichText}
            editionId={editionDetails?._id}
            edition={editionDetails}
          />
        </FormControl>
        <Button
          disabled={postLoading}
          colorScheme="green"
          onClick={handlePreviewPage}
          fontSize="md"
          py={4}
        >
          {postLoading && <Spinner size="sm" color="white" />}
          {postLoading ? (isEditMode ? "Updating Post..." : "Creating Post...") : "Save & Preview"}
        </Button>
      </Stack>


       <LibraryImageSelector
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        editionId={editionDetails?._id}
        onImageSelect={handleLibraryImage}
        mergeImages={true}
      />
    </Box>
  );
};

export default PostForm; 