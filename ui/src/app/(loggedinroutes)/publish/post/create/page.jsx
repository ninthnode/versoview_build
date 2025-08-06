"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { createNewPost } from "@/redux/posts/postActions";
import { fetchLoggedInUserChannel } from "@/redux/channel/channelActions";
import { clearTempLibraryImages } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { blobToFile } from "@/utils/fileUtils";
import PostForm from "@/components/post/PostForm";
import PostPreview from "../PostPreview";
import genres from "@/static-data/genres";
const PublishPost = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
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
    dispatch(fetchLoggedInUserChannel());
  }, []);

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
      formData.editionId = "";
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
      <Flex py={5} justify="center">
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
            editionDetails={null}
            handleSubmit={handleSubmit}
            postLoading={postLoading}
            isEditMode={false}
            handlePreview={handlePreview}
            showPreviewButton={true}
          />
        ) : (
          <Box
            w="100%"
            maxW="2xl"
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
      </Flex>
    </Box>
  );
};

export default PublishPost;
