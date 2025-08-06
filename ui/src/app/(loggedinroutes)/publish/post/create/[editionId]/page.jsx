"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { createNewPost } from "@/redux/posts/postActions";
import { fetchLoggedInUserChannel } from "@/redux/channel/channelActions";
import { clearTempLibraryImages } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { getEditionById, cleanEdition } from "@/redux/publish/publishActions";
import { blobToFile } from "@/utils/fileUtils";
import PdfViewer from "@/components/post/PdfViewer";
import PostForm from "@/components/post/PostForm";
import PostPreview from "../../PostPreview";
import genres from "@/static-data/genres";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "../../pdf.css";

const PublishPdfPost = ({ params }) => {
  const dispatch = useDispatch();
  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
  const editionDetails = useSelector((s) => s.publish.singleEdition);
  const userChannel = useSelector((s) => s.channel.userChannel);
  const { tempLibraryImages } = useSelector((s) => s.publish);
  
  const [isEditing, setIsEditing] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubSection, setSelectedSubSection] = useState("");
  const [croppedImage, setCroppedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    header: "",
    standFirst: "",
    credits: "",
    bodyRichText: "",
    mainImageURL: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      // Dispatch the necessary actions
      console.log("Fetching data for editionId:", params.editionId);
      await dispatch(fetchLoggedInUserChannel());
      await dispatch(getEditionById(params.editionId));
    };
    fetchData();

    // Optional cleanup
    return () => {
      console.log("Cleaning up create page");
      dispatch(cleanEdition());
    };
  }, [dispatch, params.editionId]);

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
      formData.section = genres[selectedSection]?.genre ||"";
      formData.subSection = selectedSubSection||"";
      formData.editionId = editionDetails._id;
      formData.libraryImages = tempLibraryImages;
      dispatch(createNewPost(key, content_type, image, formData));
      // Clear temporary images after successful submission
      dispatch(clearTempLibraryImages());
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePreview = () => {
    setIsEditing(!isEditing);
  };

  const handlePublish = () => {
    handleSubmit();
  };

  return (
    <Box mb={"60px"} px={{ base: 2, md: 4 }}>
      <Flex 
        py={5} 
        gap={{ base: 2, md: 4 }}
        direction={{ base: "column", lg: "row" }}
        align={{ base: "center", lg: "flex-start" }}
      >
        {/* PDF Preview Section */}
        {editionDetails && editionDetails.pdfUrls && (
          <Box 
            w={{ base: "100%", lg: "60%" }} 
            mb={{ base: 4, lg: 0 }}
            display="flex"
            justifyContent="center"
          >
            <PdfViewer pdfUrls={editionDetails.pdfUrls} />
          </Box>
        )}

        <Box w={{ base: "100%", lg: editionDetails?.pdfUrls ? "60%" : "100%" }}>
          {isEditing ? (
            <PostForm 
            formData={formData}
            setFormData={setFormData}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            croppedImage={croppedImage}
            setCroppedImage={setCroppedImage}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedSubSection={selectedSubSection}
            setSelectedSubSection={setSelectedSubSection}
            editionDetails={editionDetails}
            handleSubmit={handleSubmit}
            postLoading={postLoading}
            isEditMode={false}
            handlePreview={handlePreview}
            showPreviewButton={true}
          />
          ) : (
            <Box
              w="100%"
              h="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              px={{ base: 2, md: 0 }}
            >
              <PostPreview
                post={formData}
                croppedImage={croppedImage}
                uploadedImage={uploadedImage}
                selectedSection={genres[selectedSection]?.genre || ""}
                selectedSubSection={selectedSubSection || ""}
                userChannel={userChannel}
                postLoading={postLoading}
                handleSubmit={handleSubmit}
                isEditPost={false}
                handleEditSubmit={null}
                handlePreviewPage={handlePreview}
                handlePublish={handlePublish}
              />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default PublishPdfPost;
