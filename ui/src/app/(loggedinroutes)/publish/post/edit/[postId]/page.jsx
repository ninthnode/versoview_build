"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import {
  editPost,
  getPostByIdEditData,
  clearPostEditData,
} from "@/redux/posts/postActions";
import { fetchLoggedInUserChannel } from "@/redux/channel/channelActions";
import { clearTempLibraryImages } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { blobToFile } from "@/utils/fileUtils";
import PostForm from "@/components/post/PostForm";
import PostPreview from "../../PostPreview";
import genres from "@/static-data/genres";
const PublishPost = ({params}) => {
  const dispatch = useDispatch();
  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
  const editPostId = params.postId
  const singlePostEditContent = useSelector(
    (s) => s.post.singlePostEditContent
  );
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
    // Clear previous post edit data and fetch new data when editPostId changes
    dispatch(clearPostEditData());
    dispatch(getPostByIdEditData(editPostId));

    return () => {
      // Cleanup: clear edit data when component unmounts
      dispatch(clearPostEditData());
    };
  }, [editPostId]);

  useEffect(() => {
    const fetchAndSetData = async () => {
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
      }
    };

   fetchAndSetData();
  }, [singlePostEditContent]);

  useEffect(() => {
    dispatch(fetchLoggedInUserChannel());
  }, []);

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
      formData.section = genres[selectedSection]?.genre ||"";
      formData.subSection = selectedSubSection||"";
      formData.libraryImages = tempLibraryImages;
      dispatch(editPost(key, content_type, image, formData, editPostId));
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
    handleEditSubmit();
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
            handleSubmit={handleEditSubmit}
            postLoading={postLoading}
            isEditMode={true}
            handlePreview={handlePreview}
            showPreviewButton={true}
            postId={editPostId}
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
              handleSubmit={handleEditSubmit}
              isEditPost={true}
              handleEditSubmit={handleEditSubmit}
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
