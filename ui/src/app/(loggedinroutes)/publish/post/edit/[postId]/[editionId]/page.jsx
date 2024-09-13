"use client";
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
  Radio,
  RadioGroup,
  Image,
  Text,
  Select,
  Spinner,
} from "@chakra-ui/react";
import {
  createNewPost,
  editPost,
  getPostByIdEditData,
} from "@/redux/posts/postActions";
import { fetchLoggedInUserChannel } from "@/redux/channel/channelActions";
import { useDispatch, useSelector } from "react-redux";
import genres from "@/static-data/genres";
import DOMPurify from "dompurify";
import dynamic from "next/dynamic";
import PostPreview from "../../../PostPreview";
import { useToast } from "@chakra-ui/react";
import ImageCropper from "@/components/Image-cropper/ImageCropper";
import { useRouter } from "next/navigation";
import useDeviceType from "@/components/useDeviceType";
import { IoArrowBack } from "react-icons/io5";
import { getEditionById } from "@/redux/publish/publishActions";
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});
const PublishPost = ({ params }) => {
  const dispatch = useDispatch();
  const deviceType = useDeviceType();

  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
  const isEditPost = useSelector((s) => s.post.isEditPost);
  const editPostId = params.postId;
  const editionDetails = useSelector((s) => s.publish.singleEdition)
  const singlePostEditContent = useSelector(
    (s) => s.post.singlePostEditContent
  );
  const userChannel = useSelector((s) => s.channel.userChannel);
  const [isEditing, setIsEditing] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubSection, setSelectedSubSection] = useState("");

  const [croppedImage, setCroppedImage] = useState(null);
  const [imageSizeError, setImageSizeError] = useState("");

  const handleCropComplete = (croppedImageUrl) => {
    setCroppedImage(croppedImageUrl);
  };

  const [formData, setFormData] = useState({
    header: "",
    standFirst: "",
    credits: "",
    bodyRichText: "",
    mainImageURL: "",
  });

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (singlePostEditContent?.post === undefined) {
        await dispatch(getPostByIdEditData(editPostId));
      }

      if (singlePostEditContent?.post) {
        console.log(singlePostEditContent)
        setFormData((prevFormData) => ({
          ...prevFormData,
          header: singlePostEditContent.post.header,
          standFirst: singlePostEditContent.post.standFirst,
          credits: singlePostEditContent.post.credits,
          bodyRichText: singlePostEditContent.post.bodyRichText,
        }));

        let sectionIndex = genres.findIndex(
          (g) => g.genre === singlePostEditContent.post.section
        );
        setSelectedSection(sectionIndex);
        setSelectedSubSection(singlePostEditContent.post.subSection);

        let imageName =
          singlePostEditContent.post.mainImageURL.lastIndexOf("/") + 1;
        let postImage = await blobToFile(
          singlePostEditContent.post.mainImageURL,
          imageName
        );
        const imageDataUrl = await readFile(postImage);
        setUploadedImage(imageDataUrl);
        // setCroppedImage(imageDataUrl);
      }
    };

    fetchAndSetData();
  }, [singlePostEditContent]);

  useEffect(() => {
    dispatch(fetchLoggedInUserChannel());
    dispatch(getEditionById(params.editionId));
  }, []);

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
      setUploadedImage(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  async function blobToFile(blobUrl, fileName) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });

    return file;
  }

  const handleSubmit = async () => {
    try {
      let image = "";
      let content_type = "";
      let key = "";
      if (croppedImage) {
        const defaultFileName = `image-${Date.now()}.png`;
        const fileName = defaultFileName;

        image = croppedImage
          ? await blobToFile(croppedImage, fileName)
          : await blobToFile(uploadedImage, fileName);
        content_type = image.type;
        key = `test/image/${image.name}`;
      }
      formData.section = genres[selectedSection].genre;
      formData.subSection = selectedSubSection;
      dispatch(createNewPost(key, content_type, image, formData));
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const handleEditSubmit = async () => {
    try {
      let image = "";
      let content_type = "";
      let key = "";
      if (croppedImage) {
        const defaultFileName = `image-${Date.now()}.png`;
        const fileName = defaultFileName;

        image = croppedImage
          ? await blobToFile(croppedImage, fileName)
          : await blobToFile(uploadedImage, fileName);
        content_type = image.type;
        key = `test/image/${image.name}`;
      }
      formData.section = genres[selectedSection].genre;
      formData.subSection = selectedSubSection;
      dispatch(editPost(key, content_type, image, formData, editPostId));
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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

    if (!header || !selectedSection || !selectedSubSection) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mendatory * fields.",
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
    setIsEditing(!isEditing);
  };
  const handleLibraryImage = async (img) => {
    setUploadedImage(img);
  };
  return (
    <Box mb={"60px"}>
      <Flex py={5} gap="4">
        {/* PDF Preview Section */}
        <Box
          w="60%"
          border="1px solid black"
          display={{ base: "none", md: "block" }}
        >
          <Heading fontSize="md" textAlign="center" my={4}>
            PDF PREVIEW
          </Heading>
          <Box border="1px solid #e2e8f0" h="100vh">
            <Flex direction="column" align="center" justify="center" h="full">
              {/* <Box bg="gray.100" w="100%" h="45%" mb={2} />
                <Box bg="gray.100" w="100%" h="45%" /> */}
              <iframe
                src={editionDetails.pdfUrl}
                title="title"
                height="1500px"
                width="100%"
              ></iframe>
            </Flex>
          </Box>
        </Box>

        {isEditing ? (
          <Box w={{ base: "100%", lg: "60%" }}>
            {/* Form Section */}
            <Stack spacing={4}>

              <Box w="100%">
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    px="4"
                  >
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
                      <label for="files" class="btn">
                        UPLOAD IMAGE
                      </label>
                    </div>
                  </Flex>
                  <FormControl id="mainImage">
                    <Box
                      border="3px dashed #e2e8f0"
                      width="100%"
                      maxWidth="360px"
                      height="205px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      m="0 auto"
                      position="relative"
                      borderColor={
                        imageSizeError != ""
                          ? "red.500"
                          : croppedImage && uploadedImage
                          ? "#e2e8f0"
                          : uploadedImage
                          ? "green.500"
                          : "#e2e8f0"
                      }
                    >
                      <ImageCropper
                        croppedImage={croppedImage}
                        uploadedImage={uploadedImage}
                        onCropComplete={handleCropComplete}
                        imageSizeError={imageSizeError}
                        setCroppedImage={setCroppedImage}
                        setUploadedImage={setUploadedImage}
                        edition={editionDetails}
                        handleLibraryImage={handleLibraryImage}
                      />
                    </Box>
                  </FormControl>
                  <Box p="0">
                    {deviceType == "phone" && (
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
                  <Flex
                    mb="4"
                    direction={{ base: "row", md: "column" }}
                    gap={2}
                  >
                      <FormControl id="section" mr={4}>
                      <FormLabel fontSize="sm">Edition*</FormLabel>
                        <Input
                          size="sm"
                          type="text"
                          placeholder="The Green Room"
                          value={editionDetails.editionText}
                          isDisabled={true}
                          maxLength={70}
                          color="#000"
                        />
                      </FormControl>
                    <FormControl id="section" mr={4}>
                      <FormLabel fontSize="sm">SECTION*</FormLabel>
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
                      <FormLabel fontSize="sm">SUB SECTION*</FormLabel>
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
                {postLoading ? "Creating Post.." : "Save & Preview"}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box
            w="100%"
            h="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <PostPreview
              post={formData}
              croppedImage={croppedImage}
              uploadedImage={uploadedImage}
              selectedSection={genres[selectedSection].genre}
              selectedSubSection={selectedSubSection}
              userChannel={userChannel}
              postLoading={postLoading}
              handleSubmit={handleSubmit}
              isEditPost={true}
              handleEditSubmit={handleEditSubmit}
              handlePreviewPage={handlePreviewPage}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default PublishPost;
