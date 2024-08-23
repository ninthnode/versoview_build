"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Text,
  Flex,
  Image,
  Link,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  IconButton,
  Spinner
} from "@chakra-ui/react";
import { CiBookmark } from "react-icons/ci";
import { BsChat } from "react-icons/bs";
import ShareButton from "@/components/posts/ShareButton";
import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";

import { connect } from "react-redux";
import PostMenu from "@/components/posts/PostMenu";
import { formatDate } from "@/app/utils/DateUtils";
import { setNavTitle } from "@/redux/navbar/action";
import DOMPurify from "dompurify";

function PostPreview({
  post,
  uploadedImage,
  croppedImage,
  selectedSection,
  selectedSubSection,
  userChannel,
  handlePreviewPage,
  handleSubmit,
  isEditPost,
  handleEditSubmit,
  postLoading
}) {
  return (
    <Box maxW="2xl">
      {post ? (
        <>
          <Card
            w={"100%"}
            mt={2}
            mb={4}
            style={{ "--card-shadow": "transparent" }}
          >
            <CardHeader py={0} px="0">
              <Flex spacing="4">
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Avatar
                    size="sm"
                    borderRadius={10}
                    src={
                      userChannel.channelIconImageUrl
                        ? userChannel.channelIconImageUrl
                        : "../assets/default-post-image.svg"
                    }
                  />
                  <Box>
                    <Heading size="sm">{userChannel.channelName}</Heading>
                  </Box>
                </Flex>
                <PostMenu url={``} title={"post.header"} disabled={true} />
                <IconButton
                  variant="ghost"
                  aria-label="See menu"
                  fontSize="20px"
                  icon={<CiBookmark />}
                  disabled={true}
                />
              </Flex>
            </CardHeader>
            <Image
              border="1px solid lightgray"
              borderRadius="md"
              objectFit="cover"
              src={croppedImage}
              alt={post.header}
            />
            <CardBody pt="2" px="0">
              <Text
                fontSize="12px"
                mt="1"
                display="flex"
                alignItems="center"
                color="textlight"
                pb={2}
              >
                {selectedSection} - {selectedSubSection} •{" "}
                {formatDate(post.createdAt)} • 6min read
              </Text>

              <Divider />
              <Flex py="1" gap={1}>
                <Flex w="300px" justify="space-between">
                  <Button
                    px="2"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <BsChat colorScheme="textlight" fontSize="28px" />
                    }
                    isDisabled={true}
                    onClick={() => onToggleCommentModal()}
                  >
                    0
                  </Button>
                  <Button
                    px="2"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatUpLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    isDisabled={true}
                    onClick={() => {
                      updatePostUpvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"green.500"}>0</Text>
                  </Button>
                  <Button
                    px="2"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatDownLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    isDisabled={true}
                    onClick={() => {
                      updatePostDownvote(params.id);
                      getPostById(params.id);
                    }}
                  >
                    <Text color={"red.500"}>0</Text>
                  </Button>
                </Flex>
                <Flex w="100%" justify="flex-end">
                  <ShareButton
                    url={``}
                    title=''
                    shareButton={true}
                    isDisabled={true}
                  />
                </Flex>
              </Flex>
              <Divider />
              <div>
                <Text mt="2" w="fit-content" p="1">
                  By {userChannel.channelName}
                </Text>
                {post.credits&&<Text mt="2" w="fit-content" p="1" fontSize='sm'>
                  Credits {post.credits}
                </Text>}
                <Heading py='2' mb="1" fontWeight='bold' fontSize='lg' lineHeight='2rem'>
                  {post.header}
                </Heading>
                <Text pb='2' mb="1" fontWeight='semibold' fontSize='1.2rem' lineHeight='2rem'>
                  {post.standFirst}
                </Text>
                <Text
                  fontSize="md"
                  textAlign="left"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.bodyRichText),
                  }}
                />
              </div>
              <Button
                mt={6}
                size="full"
                w='100%'
                colorScheme="red"
                fontSize='md'
                textAlign='center'
                py={3}
                onClick={handlePreviewPage}
              >
                Edit
              </Button>
              <Box my='4'>

              <Text fontWeight='bold' fontSize='md'>CONTENT RIGHTS</Text>
              <Text fontSize='md'>
                By clicking Save and Publish you are agreeing you confirm to
                us that you hold all the necessary copyright and other rights to
                allow us to make the content of your publication public
                worldwide.
              </Text>
              </Box>
              <Button
                mt={4}
                w='100%'
                size="full"
                colorScheme="green"
                fontSize='md'
                py={4}
                onClick={isEditPost?handleEditSubmit:handleSubmit}
              >
                {postLoading && <Spinner size="sm" color="white" />}
                {postLoading ? "Creating Post.." : "Save"}
              </Button>
            </CardBody>
          </Card>
        </>
      ) : (
        ""
      )}
    </Box>
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setNavTitle: (title, icon) => dispatch(setNavTitle(title, icon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostPreview);
