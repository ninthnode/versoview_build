import React, { useState, useEffect, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
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
  showPreviewButton = false,
  postId = null,
}) => {
  const deviceType = useDeviceType();
  const toast = useToast();
  const [imageSizeError, setImageSizeError] = useState("");
  const [libraryImages, setLibraryImages] = useState([]);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isLoadingFeatureImage, setIsLoadingFeatureImage] = useState(false);
  
  const dispatch = useDispatch();
  const { tempLibraryImages } = useSelector((state) => state.publish);
  
  // Refs for file inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // Function to clear file inputs
  const clearFileInputs = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };
  
  // Debug log for PostForm Redux state
  useEffect(() => {
    console.log('PostForm: tempLibraryImages updated:', tempLibraryImages?.length || 0);
  }, [tempLibraryImages]);

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
      // if (file.size > maxSize) {
      //   setImageSizeError(
      //     "File size exceeds the 5MB limit. Select a smaller file."
      //   );
      //   setUploadedImage("");
      //   setCroppedImage("");
      //   return;
      // }
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
    const { header } = formData;

    if (!header) {
      toast({
        title: "Header Required",
        description: "Please fill in the Header field.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (uploadedImage && !croppedImage) {
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
  const proxiedUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/image-proxy?url=` + encodeURIComponent(url);
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

  // Remove this function since we're using Redux now

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
    <Box w={{ base: "100%", lg: "100%" }} px={{ base: 0, md: 4 }}>
      {/* Form Section */}
      <Stack spacing={{ base: 3, md: 4 }}>
        <Box w="100%">
          <Flex justifyContent="space-between" alignItems="center" px={{ base: 2, md: 4 }} mb={2}>
            <Text fontSize={{ base: "xs", md: "sm" }}>MAIN IMAGE</Text>
            <div>
              <Input
                ref={fileInputRef}
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
                ref={cameraInputRef}
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
              <label htmlFor="files" className="btn" style={{ fontSize: deviceType === "phone" ? "0.75rem" : "0.875rem" }}>
                UPLOAD IMAGE
              </label>
            </div>
          </Flex>
          <FormControl id="mainImage"  h="200px">
            <Box
              border="3px dashed #e2e8f0"
              width={{ base: "90vw", sm: "360px" }}  // 90% viewport width on mobile, 360px on larger screens
              maxWidth="360px"
              aspectRatio="360/205"
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
                clearFileInputs={clearFileInputs}
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
        {editionDetails && (  
            <FormControl id="edition" mb="4" mr={{ base: 0, md: 4 }}>
              <FormLabel fontSize={{ base: "xs", md: "sm" }}>Edition*</FormLabel>
              <Input
                size={{ base: "sm", md: "sm" }}
                type="text"
                placeholder=""
                value={editionDetails?.editionText || ""}
                isDisabled={true}
                maxLength={70}
                color="#000"
              />
            </FormControl>
          )}
          <Flex mb="4" direction={{ base: "column", md: "row" }} gap={{ base: 3, md: 2 }}>
            <FormControl id="section" mr={{ base: 0, md: 4 }}>
              <FormLabel fontSize={{ base: "xs", md: "sm" }}>SECTION</FormLabel>
              <Select
                size={{ base: "sm", md: "sm" }}
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
              <FormLabel fontSize={{ base: "xs", md: "sm" }}>SUB SECTION</FormLabel>
              <Select
                size={{ base: "sm", md: "sm" }}
                value={selectedSubSection}
                onChange={(e) => setSelectedSubSection(e.target.value)}
                disabled={!selectedSection || genres[selectedSection]?.genre === "Other"}
              >
                <option value="">Select a sub-section</option>
                {selectedSection &&
                  genres[selectedSection]?.subGenres.map((subGenre) => (
                    <option key={subGenre} value={subGenre}>
                      {subGenre}
                    </option>
                  ))}
              </Select>
            </FormControl>
          </Flex>
          <FormControl id="header" mb={{ base: 3, md: 4 }}>
            <FormLabel fontSize={{ base: "xs", md: "sm" }}>HEADER*</FormLabel>
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
          <FormControl id="standFirst" mb={{ base: 3, md: 4 }}>
            <FormLabel fontSize={{ base: "xs", md: "sm" }}>STAND-FIRST</FormLabel>
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
          <FormControl id="credits" mb={{ base: 3, md: 4 }}>
            <FormLabel fontSize={{ base: "xs", md: "sm" }}>CREDITS</FormLabel>
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
          <FormLabel fontSize={{ base: "xs", md: "sm" }}>BODY COPY</FormLabel>
          <Box minH={{ base: "200px", md: "300px" }}>
            <RichTextEditor
              handleTextBodyChange={handleTextBodyChange}
              bodyRichText={formData.bodyRichText}
              initialValue={formData.bodyRichText}
              editionId={editionDetails?._id}
              postId={postId} // Will be updated when we have postId after saving
              edition={editionDetails}
            />
          </Box>
        </FormControl>
        {showPreviewButton ? (
          <Button
            disabled={postLoading}
            colorScheme="green"
            onClick={handlePreviewPage}
            fontSize={{ base: "sm", md: "md" }}
            py={4}
            w={{ base: "100%", md: "auto" }}
          >
            {postLoading && <Spinner size="sm" color="white" />}
            {postLoading ? (isEditMode ? "Updating Post..." : "Creating Post...") : "Save & Preview"}
          </Button>
        ) : (
          <Button
            disabled={postLoading}
            colorScheme="blue"
            onClick={handleSubmit}
            fontSize={{ base: "sm", md: "md" }}
            py={4}
            w={{ base: "100%", md: "auto" }}
          >
            {postLoading && <Spinner size="sm" color="white" />}
            {postLoading ? (isEditMode ? "Updating Post..." : "Publishing...") : "Publish"}
          </Button>
        )}
      </Stack>


       <LibraryImageSelector
        key="postform-library-selector"
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        editionId={editionDetails?._id}
        postId={postId}
        onImageSelect={handleLibraryImage}
      />
    </Box>
  );
};

export default PostForm; 