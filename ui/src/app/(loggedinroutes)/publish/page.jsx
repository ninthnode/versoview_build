"use client";
import React, { useState } from "react";
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
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import {createNewPost} from "@/redux/posts/postActions"
import { useDispatch } from "react-redux";

const PublishPost = () => {
  const dispatch = useDispatch();

  const [uploadType, setUploadType] = useState("upload");
  const [postImageLink, setPostImageLink] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [formData, setFormData] = useState({
    section: "",
    subsection: "",
    header: "",
    standFirst: "",
    credits: "",
    bodyCopy: "",
    mainImageURL: "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
  };
  const handleSubmit = async () => {
    try {
      const content_type = uploadedImage.type;
      const key = `test/image/${uploadedImage.name}`;
      
      dispatch(createNewPost(key, content_type,uploadedImage,formData))
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Box ml="4">
      <Flex p={5}>
        {/* PDF Preview Section */}
        <Box
          w="40%"
          border="1px solid black"
          p={2}
          mr={5}
          display={{ base: "none", md: "block" }}
        >
          <Heading size="md" mb={4}>
            PDF PREVIEW
          </Heading>
          <Box border="1px solid #e2e8f0" h="80vh">
            <Flex direction="column" align="center" justify="center" h="full">
              <Box bg="gray.100" w="100%" h="45%" mb={2} />
              <Box bg="gray.100" w="100%" h="45%" />
            </Flex>
          </Box>
        </Box>

        {/* Form Section */}
        <Box w={{ base: "100%", lg: "60%" }}>
          <Stack spacing={4}>
            <Flex flexDirection={{ base: "column", md: "row" }}>
              <Box px="4">
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
                    {uploadedImage ? (
                      <Image
                        src={URL.createObjectURL(uploadedImage)}
                        alt="Uploaded Image"
                        maxH="100%"
                      />
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
                      <Radio size="sm" value="upload">
                        Upload image
                      </Radio>
                      <Radio size="sm" value="library">
                        Use image from library
                      </Radio>
                    </Stack>
                  </RadioGroup>
                  {uploadType === "upload" && (
                    <Input
                      type="file"
                      accept="image/*"
                      size="sm"
                      mt={2}
                      onChange={handleFileSelect}
                    />
                  )}
                </FormControl>
              </Box>
              <Box>
                <Flex mb="4">
                  <FormControl id="section" mr={4}>
                    <FormLabel fontSize="sm">SECTION*</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="Entertaining"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl id="subsection">
                    <FormLabel fontSize="sm">SUBSECTION*</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="Outdoor Living"
                      value={formData.subsection}
                      onChange={(e) =>
                        setFormData({ ...formData, subsection: e.target.value })
                      }
                    />
                  </FormControl>
                </Flex>
                <FormControl id="header" mb="4">
                  <FormLabel fontSize="sm">HEADER*</FormLabel>
                  <Input
                    size="sm"
                    type="text"
                    placeholder="The Green Room"
                    value={formData.header}
                    onChange={(e) =>
                      setFormData({ ...formData, header: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl id="standFirst" mb="4">
                  <FormLabel fontSize="sm">STAND-FIRST*</FormLabel>
                  <Input
                    size="sm"
                    type="text"
                    placeholder="Nature's colour palette helps lines this..."
                    value={formData.standFirst}
                    onChange={(e) =>
                      setFormData({ ...formData, standFirst: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl id="credits" mb="4">
                  <FormLabel fontSize="sm">CREDITS*</FormLabel>
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
            </Flex>
            <FormControl id="bodyCopy">
              <FormLabel fontSize="sm">BODY COPY*</FormLabel>
              <Textarea
                size="sm"
                placeholder="Enter body text..."
                value={formData.bodyCopy}
                onChange={(e) =>
                  setFormData({ ...formData, bodyCopy: e.target.value })
                }
                rows={10}
              />
            </FormControl>
            <Button size="sm" colorScheme="green" onClick={handleSubmit}>
              Save
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default PublishPost;
