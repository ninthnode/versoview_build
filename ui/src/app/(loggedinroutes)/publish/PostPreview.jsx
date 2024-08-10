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
import { FaRegComment } from "react-icons/fa";
import { CiBookmark } from "react-icons/ci";

import { PiArrowFatDownLight, PiArrowFatUpLight } from "react-icons/pi";

import { connect } from "react-redux";
import ShareButton from "@/components/ShareButton";
import { formatDate } from "@/app/utils/DateUtils";
import { setNavTitle } from "@/redux/navbar/action";
import DOMPurify from "dompurify";

function PostPreview({
  post,
  uploadedImage,
  selectedSection,
  selectedSubSection,
  userChannel,
  handlePreviewPage,
  handleSubmit,
  postLoading
}) {
  return (
    <Box maxW="2xl" px={4}>
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
                <ShareButton url={``} title={"post.header"} disabled={true} />
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
              src={window.URL.createObjectURL(uploadedImage)}
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
                <Flex w="240px" justify="space-between">
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <FaRegComment colorScheme="textlight" fontSize="28px" />
                    }
                    disabled={true}
                  >
                    0
                  </Button>
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatUpLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    disabled={true}
                  >
                    <Text color={"green.500"}>0</Text>
                  </Button>
                  <Button
                    pl="0"
                    variant="ghost"
                    fontWeight="regular"
                    color="textlight"
                    leftIcon={
                      <PiArrowFatDownLight
                        colorScheme="textlight"
                        fontSize="28px"
                      />
                    }
                    disabled={true}
                  >
                    <Text color={"red.500"}>0</Text>
                  </Button>
                </Flex>
              </Flex>
              <Divider />
              <div>
                <Text mt="2" w="fit-content" p="1">
                  By {userChannel.channelName}
                </Text>
                <Heading size="md" as="h6" mt="2" mb="4">
                  {post.header}
                </Heading>
                <Text
                  fontSize='md'
                  textAlign="justify"
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
                fontSize='lg'
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
                fontSize='lg'
                py={3}
                onClick={handleSubmit}
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
