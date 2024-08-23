import React from "react";
import {
  Box,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { CiSearch, CiBookmark, CiUser } from "react-icons/ci";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { formatDate } from "../../utils/DateUtils";
import PostMenu from "@/components/posts/PostMenu";
import getExcerpt from "@/app/utils/GetExcerpt";
import DOMPurify from "dompurify";
const PostCard = ({
  post,
  small = false,
  showBookmarkButton = true,
  submitBookmark,
  isbookmarkScreenCard = false,
}) => {
  return (
    <Card maxW="2xl" mb={4} boxShadow="none">
      <CardHeader p={1} border="0">
        <Flex spacing="4">
          <Flex flex="1" gap="2" alignItems="center" flexWrap="wrap">
            <Link href={`/channel/${post.channelId._id}`}>
              <Avatar
                size="sm"
                p="0"
                borderRadius={10}
                src={post.channelId?.channelIconImageUrl}
              />
            </Link>
            <Box>
              <Link href={`/channel/${post.channelId._id}`}>
                <Text fontWeight="bold" fontSize="md">
                  {post.channelId?.channelName}
                </Text>
              </Link>
            </Box>
          </Flex>
          {!small && (
            <PostMenu
              url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post._id}`}
              title={post.header}
            />
          )}
          {showBookmarkButton && (
            <IconButton
              variant="nostyle"
              color={post.isBookmarked || isbookmarkScreenCard ? "green.500" : "gray"}
              aria-label="See menu"
              fontSize="lg"
              textAlign="right"
              justifyContent="flex-end"
              p="0"
              icon={
                post.isBookmarked || isbookmarkScreenCard? (
                  <BookmarkFilled style={{ margin: -6 }} />
                ) : (
                  <CiBookmark style={{ margin: -6 }} />
                )
              }
              onClick={() => submitBookmark("post", post._id)}
            />
          )}
        </Flex>
      </CardHeader>
      {!small && (
        <Image
          border="1px solid lightgray"
          borderRadius="md"
          objectFit="cover"
          // h="300px"
          src={post.mainImageURL || "/assets/default-post-image.svg"}
          alt={post.header}
        />
      )}
      <CardBody ml="1" p="0" border="0">
        <Text
          fontSize="sm"
          pt="2"
          display="flex"
          gap="10px"
          alignItems="center"
          color="textlight"
        >
        {post.section} - {post.subSection} • {formatDate(post.createdAt)} • {" "}
          {post.readingTime} read
          {/* <Button
            variant="ghost"
            colorScheme="gray"
            aria-label="See menu"
            leftIcon={<GoCommentDiscussion />}
            p="1"
            fontSize="12px"
            height="2rem"
          >
            127
          </Button> */}
        </Text>

        <Link href={`/post/${post._id}`}>
          <Heading
            py="1"
            mb="1"
            fontWeight="bold"
            fontSize="lg"
            lineHeight="2rem"
          >
            {post.header}
          </Heading>
        </Link>
        <Text
          fontSize="md"
          textAlign="justify"
          dangerouslySetInnerHTML={{
            __html: getExcerpt(DOMPurify.sanitize(post.bodyRichText), 150),
          }}
        />
      </CardBody>
    </Card>
  );
};

export default PostCard;
