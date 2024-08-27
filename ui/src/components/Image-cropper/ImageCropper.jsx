import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";
import { FaCheck } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { Image, Text,Flex } from "@chakra-ui/react";
import { FaCamera } from "react-icons/fa";

const ImageCropper = ({ onCropComplete, uploadedImage, croppedImage,imageSizeError,setCroppedImage }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

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
            <Image
              objectFit="cover"
              src={croppedImage ? croppedImage : uploadedImage}
              alt="Cropped Image"
              w="100%"
              h="100%"
            />
          )}
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "-12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
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
          </div>
        </div>
      ) : (
        <Flex flexDirection={
          "column"
        } alignItems="center">
          <label for="files" class="btn">
            <FaCamera fontSize="3rem" />
          </label>
          <Text>{imageSizeError}</Text>
        </Flex>
      )}
    </div>
  );
};

export default ImageCropper;
