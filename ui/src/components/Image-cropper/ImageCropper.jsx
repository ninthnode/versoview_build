import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { Image as ChakraImage, Text,Flex, Tooltip,useDisclosure } from "@chakra-ui/react";
import { FaUpload,FaCamera } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import LibraryModal from "@/components/publish/LibraryModal";
const axios = require('axios');

const ImageCropper = ({ onCropComplete, uploadedImage, croppedImage,imageSizeError,setCroppedImage,setUploadedImage,edition,handleLibraryImage,libraryImages, setLibraryImages }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    try {
      const croppedImg = await getCroppedImg(uploadedImage, croppedAreaPixels);
      onCropComplete(croppedImg);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setCroppedImage(null);
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
              crossorigin="anonymous"
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
              backgroundColor:'#fff',
              padding:'5px',
              borderRadius:'10px',
              border:'2px solid #333'
            }}
          >
          <Flex gap='2'>
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
                onClick={()=>{setUploadedImage(null);setCroppedImage(null)}}
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
        <Flex flexDirection={
          "column"
        } alignItems="center">
          <Flex gap='4' pos="relative">
          <Tooltip label="Upload Image">
          <label for="files" class="btn">
            <FaUpload fontSize="3rem" style={{backgroundColor:"#cccc", padding:'10px',cursor:'pointer'}} />
          </label>
          </Tooltip>
          <Tooltip label="Take Photo">
          <label for="cameras" class="btn">
            <FaCamera fontSize="3rem" style={{backgroundColor:"#cccc", padding:'10px',cursor:'pointer'}}/>
          </label>
          </Tooltip>
          {edition&&<Tooltip label="Choose from Library">
          <Text onClick={onOpen}>
           <MdLibraryAdd fontSize="3rem" style={{backgroundColor:"#cccc", padding:'10px',cursor:'pointer'}}/>
          </Text>
          </Tooltip>}
          </Flex>
          <Text>{imageSizeError}</Text>
          <LibraryModal isOpen={isOpen} onClose={onClose}
          libraryImages={libraryImages}
                      setLibraryImages={setLibraryImages}
                      editionId={edition._id}
           handleLibraryImage={handleLibraryImage}/>
        </Flex>
      )}
    </div>
  );
};

export default ImageCropper;
