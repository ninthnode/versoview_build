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
import ShareButton from "@/components/ShareButton";
import getExcerpt from "@/app/utils/GetExcerpt";
import DOMPurify from "dompurify";
const PostCard = ({
  post,
  small = false,
  showBookmarkButton = true,
  submitBookmark,
}) => {
  const defaultImageUrl = "/assets/default-post-image.svg";

  return (
    <Card maxW="2xl" mb={4} boxShadow="none">
      <CardHeader p={1} border="0">
        <Flex spacing="4">
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Link href={`/channel/${post.channelId._id}`}>
              {post.channelId?.channelIconImageUrl ? (
                <Avatar
                  size="sm"
                  borderRadius={10}
                  name={"test"}
                  src={post.channelId?.channelIconImageUrl}
                />
              ) : (
                <Avatar
                  size="sm"
                  borderRadius={10}
                  name={"test"}
                  src={defaultImageUrl}
                />
              )}
            </Link>
            <Box>
              <Link href={`/channel/${post.channelId._id}`}>
                <Heading size="sm">{post.channelId?.channelName}</Heading>
              </Link>
            </Box>
          </Flex>
          {!small && (
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post._id}`}
              title={post.header}
            />
          )}
          {showBookmarkButton && (
            <IconButton
              variant="ghost"
              colorScheme={!post.isBookmarked ? "gray" : "green"}
              aria-label="See menu"
              fontSize="20px"
              icon={!post.isBookmarked ? <CiBookmark /> : <BookmarkFilled />}
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
          src={post.mainImageURL || "/assets/default-post-image.svg"}
          alt={post.header}
        />
      )}
      <CardBody ml="1" p="0" border="0">
        <Text
          fontSize="12px"
          mt="1"
          display="flex"
          gap="10px"
          alignItems="center"
          color="textlight"
          pb={2}
        >
          {post.section} - {post.subSection} • {formatDate(post.createdAt)} •
          6min read
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

        <Link href={`post/${post._id}`}>
          <Heading mb="1" size="md" as="h6">
            {post.header}
          </Heading>
        </Link>
        <Text
          fontSize="16px"
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
