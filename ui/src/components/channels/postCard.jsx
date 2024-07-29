// src/components/PostCard.js
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
import { FaBookmark as BookmarkFilled  } from "react-icons/fa6";

import { GoCommentDiscussion } from "react-icons/go";
import { formatDate, TimeFromNow } from "@/app/utils/DateUtils";
import ShareButton from "@/components/ShareButton";

const PostCard = ({ post, small = false }) => {
  const getExcerpt = (text, length) => {
    if (!text | !length) return;
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...`;
  };
  const defaultImageUrl = "/assets/default-post-image.svg";

  return (
    <Card maxW="2xl" mt={2} mb={4}>
      {!small && (
        <Image objectFit="cover" src={post.mainImageURL || '/assets/default-post-image.svg'} alt={post.header} />
      )}
      <CardBody pt="0">
        <Text
          fontSize="12px"
          mt="1"
          display="flex"
          gap="10px"
          alignItems="center"
        >
          {post.section} - {post.subSection} • {formatDate(post.createdAt)} •
          6min read
          <Button
            variant="ghost"
            colorScheme="gray"
            aria-label="See menu"
            leftIcon={<GoCommentDiscussion />}
            p="1"
            fontSize="12px"
            height="2rem"
          >
            127
          </Button>
        </Text>

        <Link href={`post/${post._id}`}>
        <Heading mb='1' size="md" as="h6">
          {post.header}
        </Heading>
        </Link>
        <Text>{getExcerpt(post.bodyRichText, 100)}</Text>
      </CardBody>
    </Card>
  );
};

export default PostCard;
