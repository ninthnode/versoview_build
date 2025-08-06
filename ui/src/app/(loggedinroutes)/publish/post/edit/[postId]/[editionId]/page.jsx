"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { editPost, getPostByIdEditData } from "@/redux/posts/postActions";
import { fetchLoggedInUserChannel } from "@/redux/channel/channelActions";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { getEditionById, cleanEdition } from "@/redux/publish/publishActions";
import { blobToFile, readFile } from "@/utils/fileUtils";
import PdfViewer from "@/components/post/PdfViewer";
import PostForm from "@/components/post/PostForm";
import PostPreview from "../../../PostPreview";
import genres from "@/static-data/genres";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "../../../pdf.css";

const EditPdfPost = ({ params }) => {
  const dispatch = useDispatch();
  const toast = useToast();

  const postLoading = useSelector((s) => s.post.loadingModify);
  const editPostId = params.postId;
  const singlePostEditContent = useSelector((s) => s.post.singlePostEditContent);
  const editionDetails = useSelector((s) => s.publish.singleEdition);
  const userChannel = useSelector((s) => s.channel.userChannel);
  
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
      console.log("Fetching data for postId:", params.postId, "editionId:", params.editionId);
      await dispatch(fetchLoggedInUserChannel());
      await dispatch(getPostByIdEditData(params.postId));
      await dispatch(getEditionById(params.editionId));
    };
    fetchData();

    return () => {
      console.log("Cleaning up edit page");
      dispatch(cleanEdition());
    };
  }, [dispatch, params.postId, params.editionId]);

  // Set form data when post content is loaded
  useEffect(() => {
    const fetchAndSetData = async () => {
      if (singlePostEditContent?.post) {
        console.log("Setting form data from post:", singlePostEditContent.post);
        setFormData({
          header: singlePostEditContent.post.header || "",
          standFirst: singlePostEditContent.post.standFirst || "",
          credits: singlePostEditContent.post.credits || "",
          bodyRichText: singlePostEditContent.post.bodyRichText || "",
          mainImageURL: singlePostEditContent.post.mainImageURL || "",
        });

        // Find section index
        let sectionIndex = Object.keys(genres).findIndex(
          (index) => genres[index].genre === singlePostEditContent.post.section
        );
        if (sectionIndex !== -1) {
          setSelectedSection(sectionIndex);
        }
        
        setSelectedSubSection(singlePostEditContent.post.subSection || "");

        // Handle image loading
        if (singlePostEditContent.post.mainImageURL) {
          console.log("Loading main image from:", singlePostEditContent.post.mainImageURL);
          let imageName = singlePostEditContent.post.mainImageURL.split('/').pop() || `image-${Date.now()}.png`;
          try {
            let postImage = await blobToFile(
              singlePostEditContent.post.mainImageURL,
              imageName
            );
            console.log("Converted to File object:", postImage);
            const imageDataUrl = await readFile(postImage);
            console.log("Converted to data URL, setting images");
            setUploadedImage(imageDataUrl);
            setCroppedImage(imageDataUrl);
          } catch (error) {
            console.error("Error loading image:", error);
          }
        }
      }
    };

    if (singlePostEditContent?.post) {
      fetchAndSetData();
    }
  }, [singlePostEditContent]);

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
      
      const updatedFormData = {
        ...formData,
        section: genres[selectedSection]?.genre || "",
        subSection: selectedSubSection,
        editionId: editionDetails?._id || singlePostEditContent?.post?.editionId
      };
      
      dispatch(editPost(key, content_type, image, updatedFormData, params.postId));
    } catch (error) {
      console.error("Error submitting edit form:", error);
    }
  };

  const handlePreview = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box mb={"60px"}>
      <Flex py={5} gap="4">
        {/* PDF Preview Section */}
        {editionDetails && editionDetails.pdfUrls && (
          <PdfViewer pdfUrls={editionDetails.pdfUrls} />
        )}

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
            handleSubmit={handleEditSubmit}
            postLoading={postLoading}
            isEditMode={true}
            handlePreview={handlePreview}
            postId={editPostId}
          />
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
              selectedSection={genres[selectedSection]?.genre || ""}
              selectedSubSection={selectedSubSection}
              userChannel={userChannel}
              postLoading={postLoading}
              handleSubmit={null}
              isEditPost={true}
              handleEditSubmit={handleEditSubmit}
              handlePreviewPage={handlePreview}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default EditPdfPost;
