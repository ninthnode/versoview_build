import { useState } from 'react';
import { Box, Input } from '@chakra-ui/react';

const ImageUploadButton = ({handleImageChange,isEditing,selectedImage}) => {
    const naImage =
    "https://via.assets.so/img.svg?w=100&h=100&tc=darkgray&bg=gray&t=N/A";
  
  return (
    <Box textAlign="center">
      <Input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        display="none"
        disabled={!isEditing}
      />
      <Box
        as="label"
        htmlFor="file-input"
        cursor="pointer"
        display="inline-block"
        boxSize="100px"
        border="2px solid"
        borderColor="gray.300"
        borderRadius="md"
        overflow="hidden"
        bg="gray.100"
        _hover={{ opacity: 0.8 }}
      >
        {!isEditing ? (
          <Box
            as="img"
            src={selectedImage!=null?selectedImage:naImage}
            alt="Selected"
            objectFit="cover"
            boxSize="100%"
          />
        ) : (
          <Box
            as="img"
            src={"assets/upload.png"}
            alt="Upload"
            objectFit="cover"
            boxSize="100%"
          />
        )}
      </Box>
    </Box>
  );
};

export default ImageUploadButton;
