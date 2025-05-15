import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import {
  Image as ChakraImage,
  Text,
  Flex,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { FaUpload, FaCamera } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import LibraryModal from "@/components/publish/LibraryModal";
const axios = require("axios");

const ImageCropper = ({
  onCropComplete,
  uploadedImage,
  croppedImage,
  imageSizeError,
  setCroppedImage,
  setUploadedImage,
  edition,
  handleLibraryImage,
  libraryImages = [],
  setLibraryImages = () => {},
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  useEffect(() => {
    console.log("ImageCropper rendered with edition:", edition);
    console.log("Uploaded image:", uploadedImage);
    console.log("Cropped image:", croppedImage);
  }, [edition, uploadedImage, croppedImage]);

  useEffect(() => {
    if (edition) {
      console.log("ImageCropper: Edition object:", edition);
      console.log("ImageCropper: Edition ID:", edition._id);
    } else {
      console.log("ImageCropper: No edition provided");
    }
  }, [edition]);

  useEffect(() => {
    if (libraryImages && libraryImages.length > 0) {
      console.log(`ImageCropper: Library images updated, count: ${libraryImages.length}`);
      if (libraryImages.length > 0) {
        console.log(`First image in library: ${libraryImages[0]}`);
      }
    }
  }, [libraryImages]);

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    try {
      console.log("Starting crop with:", uploadedImage);
      const croppedImg = await getCroppedImg(uploadedImage, croppedAreaPixels);
      console.log("Crop complete, result:", croppedImg);
      onCropComplete(croppedImg);
      setIsEditing(false);
    } catch (e) {
      console.error("Error during crop:", e);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setCroppedImage(null);
  };

  const handleLibrarySelection = (imageUrl) => {
    console.log(`===== LIBRARY IMAGE SELECTED IN IMAGECROPPER =====`);
    console.log(`Image URL: ${imageUrl}`);
    
    if (!imageUrl) {
      console.error(`No image URL provided to ImageCropper's handleLibrarySelection`);
      return;
    }
    
    // Pass the URL to the parent component
    console.log(`Calling parent handleLibraryImage function`);
    handleLibraryImage(imageUrl);
    
    // Close the modal
    console.log(`Closing modal`);
    onClose();
  };

  // Add a handler for image upload completed with better logging
  const handleImageUploadCompleted = (result) => {
    console.log(`===== Image upload completed in LibraryModal =====`);
    console.log(`Upload result:`, result);
    
    // Check if we have new library images in the result
    if (result && result.libraryImages) {
      console.log(`Result contains ${result.libraryImages.length} library images`);
      
      // If we have new library images from the upload result, update our state
      if (result.libraryImages.length > 0) {
        console.log(`Updating ImageCropper's libraryImages state`);
        setLibraryImages(result.libraryImages);
      }
    }
  };

  return (
    <div>
      {uploadedImage ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "200px",
          }}
        >
          {isEditing ? (
            <Cropper
              image={uploadedImage}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteCallback}
              objectFit="cover"
            />
          ) : (
            <ChakraImage
              objectFit="cover"
              src={croppedImage ? croppedImage : uploadedImage}
              alt="Cropped Image"
              w="100%"
              h="100%"
              crossOrigin="anonymous"
            />
          )}
          <div
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#fff",
              padding: "5px",
              borderRadius: "10px",
              border: "2px solid #333",
            }}
          >
            <Flex gap="2">
              {isEditing ? (
                <FaCheck
                  onClick={handleCrop}
                  style={{
                    backgroundColor: "#333",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "24px",
                    padding: "5px",
                    borderRadius: "5px",
                    backgroundColor: "green",
                  }}
                />
              ) : (
                <MdModeEdit
                  onClick={handleEdit}
                  style={{
                    borderRadius: "5px",
                    padding: "5px",
                    backgroundColor: "#333",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "24px",
                  }}
                />
              )}
              <FaTimes
                onClick={() => {
                  setUploadedImage(null);
                  setCroppedImage(null);
                }}
                style={{
                  borderRadius: "5px",
                  padding: "5px",
                  backgroundColor: "red",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "24px",
                }}
              />
            </Flex>
          </div>
        </div>
      ) : (
        <Flex flexDirection={"column"} alignItems="center">
          <Flex gap="4" pos="relative">
            <Tooltip label="Upload Image">
              <label htmlFor="files" className="btn">
                <FaUpload
                  fontSize="3rem"
                  style={{
                    backgroundColor: "#cccc",
                    padding: "10px",
                    cursor: "pointer",
                  }}
                />
              </label>
            </Tooltip>
            <Tooltip label="Take Photo">
              <label htmlFor="cameras" className="btn">
                <FaCamera
                  fontSize="3rem"
                  style={{
                    backgroundColor: "#cccc",
                    padding: "10px",
                    cursor: "pointer",
                  }}
                />
              </label>
            </Tooltip>
            {edition && (
              <Tooltip label="Choose from Library">
                <Text onClick={onOpen}>
                  <MdLibraryAdd
                    fontSize="3rem"
                    style={{
                      backgroundColor: "#cccc",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </Text>
              </Tooltip>
            )}
          </Flex>
          <Text>{imageSizeError}</Text>
          
          {/* Use the enhanced LibraryModal */}
          {edition && (
            <>
              {console.log("ImageCropper: Rendering LibraryModal with editionId:", edition._id)}
              <LibraryModal
                isOpen={isOpen}
                onClose={onClose}
                libraryImages={libraryImages}
                setLibraryImages={setLibraryImages}
                editionId={edition._id}
                edition={edition}
                handleLibraryImage={handleLibrarySelection}
                onImageUpload={handleImageUploadCompleted}
              />
            </>
          )}
        </Flex>
      )}
    </div>
  );
};

export default ImageCropper;
