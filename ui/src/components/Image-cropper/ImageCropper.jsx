import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg, compressImage, getImageSize } from "./utils";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import {
  Image as ChakraImage,
  Text,
  Flex,
  Tooltip,
  useDisclosure,
  Spinner,
  Box
} from "@chakra-ui/react";
import { FaUpload, FaCamera } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import Loader from "../Loader";

const ImageCropper = ({
  onCropComplete,
  uploadedImage,
  croppedImage,
  imageSizeError,
  setCroppedImage,
  setUploadedImage,
  edition,
  setIsLibraryModalOpen,
  isLoadingFeatureImage,
  clearFileInputs,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState("");

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Auto-compress images over 5MB when uploaded
  useEffect(() => {
    const handleImageCompression = async () => {
      if (uploadedImage && !isCompressing) {
        try {
          const imageSize = await getImageSize(uploadedImage);
          const sizeInMB = imageSize / (1024 * 1024);
          
          if (sizeInMB > 5) {
            setIsCompressing(true);
            setCompressionMessage(`Compressing image (${sizeInMB.toFixed(1)}MB)...`);
            
            const compressedImage = await compressImage(uploadedImage, 5, 0.9);
            const compressedSize = await getImageSize(compressedImage);
            const compressedSizeInMB = compressedSize / (1024 * 1024);
            
            setUploadedImage(compressedImage);
            setCompressionMessage(`Image compressed from ${sizeInMB.toFixed(1)}MB to ${compressedSizeInMB.toFixed(1)}MB`);
            
            // Clear compression message after 3 seconds
            setTimeout(() => {
              setCompressionMessage("");
              setIsCompressing(false);
            }, 3000);
          } else {
            setCompressionMessage("");
            setIsCompressing(false);
          }
        } catch (error) {
          console.error('Error compressing image:', error);
          setCompressionMessage("Compression failed, using original image");
          setIsCompressing(false);
          setTimeout(() => setCompressionMessage(""), 3000);
        }
      }
    };

    handleImageCompression();
  }, [uploadedImage, setUploadedImage, isCompressing]);

  const handleCrop = async () => {
    try {
      const croppedImg = await getCroppedImg(uploadedImage, croppedAreaPixels);
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

  return (
    <div>
      {uploadedImage ? (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            // width: "100%",
            // height: "200px",
          }}
           width={{ base: "90vw", sm: "360px" }}  // 90% viewport width on mobile, 360px on larger screens
              maxWidth="360px"
          aspectRatio="360/205"
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
              width={{ base: "90vw", sm: "360px" }}
             maxWidth="360px"
              aspectRatio="360/205"
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
                  setIsEditing(true);
                  if (clearFileInputs) clearFileInputs();
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
        </Box>
      ) : (
        <Flex flexDirection={"column"} alignItems="center">
          <Flex gap="4" pos="relative">
            {isLoadingFeatureImage ? (
              <Spinner size={"xl"} />
            ) : (
              <>
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
                    <Text>
                      <MdLibraryAdd
                        onClick={() => setIsLibraryModalOpen(true)}
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
              </>
            )}
          </Flex>
          <Text color="red.500">{imageSizeError}</Text>
          {compressionMessage && (
            <Text color="blue.500" fontSize="sm" mt="2" textAlign="center">
              {compressionMessage}
            </Text>
          )}
          {isCompressing && (
            <Flex align="center" justify="center" mt="2">
              <Spinner size="sm" mr="2" />
              <Text fontSize="sm" color="blue.500">
                Processing...
              </Text>
            </Flex>
          )}
        </Flex>
      )}
    </div>
  );
};

export default ImageCropper;
