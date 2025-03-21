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
import PostPreview from "../../PostPreview";
import { useToast } from "@chakra-ui/react";
import ImageCropper from "@/components/Image-cropper/ImageCropper";
import useDeviceType from "@/components/useDeviceType";
import { getEditionById, cleanEdition } from "@/redux/publish/publishActions";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "../../pdf.css";
const PublishPdfPost = ({ params }) => {
  const dispatch = useDispatch();
  const deviceType = useDeviceType();

  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
  const isEditPost = false;
  const editPostId = useSelector((s) => s.post.editPostId);
  const editionDetails = useSelector((s) => s.publish.singleEdition);
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

  const [pageStart, setPageStart] = useState(0);

  const [pdfPages, setPdfPages] = useState([]);
  const [numPages, setNumPages] = useState({});

  const [pdfLoading, setPdfLoading] = useState(true);

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

    if (isEditPost) fetchAndSetData();
  }, [isEditPost, singlePostEditContent]);

  useEffect(() => {
    const fetchData = async () => {
      // Dispatch the necessary actions
      await dispatch(fetchLoggedInUserChannel());
      await dispatch(getEditionById(params.editionId));
    };
    fetchData();

    // Optional cleanup
    return () => {
      setUploadedImage(null);
      setPdfPages([]);
      dispatch(cleanEdition());
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setPdfPages((prev) => [...prev, editionDetails.pdfUrls[pageStart]]);
    };
    if (editionDetails._id != undefined && editionDetails != undefined)
      fetchData();
  }, [pageStart, editionDetails]);

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
      formData.editionId = editionDetails._id;
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

  const blobUrlToDataUrl = async (blobUrl) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };
  const handleLibraryImage = async (img) => {
    blobUrlToDataUrl(img).then((imageDataUrl) => {
      processImage(imageDataUrl).then((processedImage) => {
        setUploadedImage(processedImage);
      });
    });
  };
  const handleScroll = (e) => {
    if (
      e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 1 &&
      !pdfLoading &&
      pdfPages.length < editionDetails.pdfUrls.length
    ) {
      loadNextPdf();
    }
  };
  const onLoadSuccess = (pdf, index) => {
    setNumPages((prev) => ({ ...prev, [index]: pdf.numPages }));
    setPdfLoading(false);
    if (pdfPages.length < editionDetails.pdfUrls.length) loadNextPdf();
  };
  const loadNextPdf = () => {
    setPageStart((prev) => prev + 1);
    setPdfLoading(true);
  };
  return (
    <Box mb={"60px"}>
      <Flex py={5} gap="4">
        {/* PDF Preview Section */}
        <Box
          w="60%"
          border="1px solid black"
          display={{ base: "none", md: "block" }}
          height="fit-content"
          pos="sticky"
          top="0"
        >
          <Heading fontSize="md" textAlign="center" my={4}>
            PDF PREVIEW
          </Heading>
          <Box border="1px solid #e2e8f0" h="100vh">
            <Flex align="flex-start" justifyContent="center" w="100%" h="full">
              <div
                style={{ width: "100%", height: "80vh", overflowY: "scroll" }}
                onScroll={handleScroll}
              >
                {pdfPages &&
                  pdfPages.map((pdf, index) => (
                    <div key={`pdf_${index}`}>
                      <Document
                        file={pdf}
                        onLoadSuccess={(pdf) => onLoadSuccess(pdf, index)}
                        renderMode={"svg"}
                      >
                        {Array.from(
                          new Array(numPages[index] || 0),
                          (_, pageIndex) => (
                            <Page
                              pageNumber={pageIndex + 1}
                              key={`page_${pageIndex + 1}`}
                            />
                          )
                        )}
                      </Document>
                    </div>
                  ))}
                {pdfLoading && (
                  <Flex w="100%" justifyContent="center" h="100px">
                    <Spinner size="md" />
                  </Flex>
                )}
              </div>
            </Flex>
          </Box>
        </Box>

        {isEditing ? (
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
                    <label for="files" class="btn">
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
                <Box p="0" mt="2">
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
                <Flex mb="4" direction={{ base: "row", md: "column" }} gap={2}>
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
                  editionId={editionDetails._id}
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
              isEditPost={isEditPost}
              handleEditSubmit={handleEditSubmit}
              handlePreviewPage={handlePreviewPage}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default PublishPdfPost;
