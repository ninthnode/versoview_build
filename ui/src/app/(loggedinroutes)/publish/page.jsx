"use client"
import React, { useState } from 'react';
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
  Radio,
  RadioGroup,
  Image
} from '@chakra-ui/react';

const PageEditor = () => {
    const [imageSrc, setImageSrc] = useState(null);
  const [uploadType, setUploadType] = useState('upload');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box ml='4'>
    <Flex p={5} >
      {/* PDF Preview Section */}
      <Box w="50%" border="1px solid black" p={2} mr={5} display={{ base: 'none', md: 'block' }}>
        <Heading size="md" mb={4}>PDF PREVIEW</Heading>
        <Box border="1px solid #e2e8f0" h="80vh">
          <Flex direction="column" align="center" justify="center" h="full">
            <Box bg="gray.100" w="100%" h="45%" mb={2} />
            <Box bg="gray.100" w="100%" h="45%" />
          </Flex>
        </Box>
      </Box>

      {/* Form Section */}
      <Box w={{ base: '100%', lg: '50%' }}>
        <Stack spacing={4}>
        <Flex flexDirection={{ base: 'column', md: 'row' }}>
    
          <Box px='4'>
          <FormControl id="mainImage">
            <FormLabel fontSize="sm">MAIN IMAGE</FormLabel>
            <Box
              border="3px dashed #e2e8f0"
              w="100%"
              h="200px"
              mb={4}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {imageSrc ? (
                <Image src={imageSrc} alt="Uploaded Image" maxH="100%" />
              ) : (
                <Box color="gray.500">No image uploaded</Box>
              )}
            </Box>
            <RadioGroup
              onChange={setUploadType}
              value={uploadType}
              defaultValue="upload"
            >
              <Stack direction="row">
                <Radio size="sm" value="upload">Upload image</Radio>
                <Radio size="sm" value="library">Use image from library</Radio>
              </Stack>
            </RadioGroup>
            {uploadType === 'upload' && (
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                size="sm"
                mt={2}
              />
            )}
          </FormControl>
          </Box>
          <Box>
          <Flex mb="4">
            <Input size="sm" variant="outline" placeholder="Home Beautiful Summer 2023 | July 1, 2023" isReadOnly />
          </Flex>
          <Flex mb="4">
            <FormControl id="section" mr={4}>
              <FormLabel fontSize='sm'>SECTION</FormLabel>
              <Input size="sm" type="text" placeholder="Entertaining" />
            </FormControl>
            <FormControl id="subsection">
              <FormLabel fontSize='sm'>SUBSECTION (OPTIONAL)</FormLabel>
              <Input size="sm" type="text" placeholder="Outdoor Living" />
            </FormControl>
          </Flex>
          <FormControl id="header" mb="4">
            <FormLabel fontSize="sm">HEADER</FormLabel>
            <Input size="sm" type="text" placeholder="The Green Room" />
          </FormControl>
          <FormControl id="standFirst" mb="4">
            <FormLabel fontSize="sm">STAND-FIRST</FormLabel>
            <Input size="sm" type="text" placeholder="Nature's colour palette helps lines this..." />
          </FormControl>
          <FormControl id="credits" mb="4">
            <FormLabel fontSize="sm">CREDITS</FormLabel>
            <Input size="sm" type="text" placeholder="Suzy Tan & Hadaway Smythe" />
          </FormControl>
          </Box>
          </Flex>
          <FormControl id="bodyCopy">
            <FormLabel fontSize="sm">BODY COPY</FormLabel>
            <Textarea size="sm" placeholder="Enter body text..."
            defaultValue="The phenomenal nature of it all has to do with the recent appearance, all over the internet, of images of grungy apes with unimpressed expressions on their faces and human clothes on their sometimes-multicolored, sometimes-metal bodies. Most of the apes look like characters one might see in a comic about hipsters in Williamsburg — some are smoking and some have pizza hanging from their lips, while others don leather jackets, beanies, and grills. He’s also the only one in the group that wasn’t working a normal nine-to-five before the sudden tsunami of their current successes — and that’s because he’s never had a “real job. Not bad for a high school dropout,” he says through a smirk. Although Goner and his comrades’ aesthetic and rapport mirror that of a musical act freshly thrust into stardom, they’re actually the creators of Yuga Labs, a Web3 company."
            rows={10} />
          </FormControl>
          <Button size="sm" colorScheme="orange">Save</Button>
        </Stack>
      </Box>
    </Flex>
    </Box>
  );
};

export default PageEditor;
