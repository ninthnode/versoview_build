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
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { CiSearch, CiBookmark, CiUser } from "react-icons/ci";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import { formatDate } from "../../utils/DateUtils";
import PostMenu from "@/components/posts/PostMenu";
import { getExcerptHtml, getExcerptText } from "@/app/utils/GetExcerpt";
import DOMPurify from "dompurify";
import useDeviceType from "@/components/useDeviceType";
import dynamic from "next/dynamic";
const PdfFlipBookModal = dynamic(() => import("@/components/posts/PdfFlipBookModal"), {
  ssr: false,
});
const PostCard = ({
  post,
  title,
  small = false,
  showBookmarkButton = true,
  submitBookmark,
  isbookmarkScreenCard = false,
}) => {
  const deviceType = useDeviceType();
  return (
    <Card maxW="2xl" mb={4} boxShadow="none">
      <CardHeader p={1}>
        <Flex
          spacing="4"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex alignItems="center" w={{ base: "220px", sm: "100%" }}>
            <Link href={`/channel/${post.channelId.username}`}>
              <Avatar
                size="sm"
                borderRadius={10}
                src={post.channelId.channelIconImageUrl}
              />
            </Link>
            <Link href={`/channel/${post.channelId.username}`}>
              <Text ml="2" fontWeight="semibold" fontSize="md">
                <Tooltip
                  label={post.channelId?.channelName}
                  aria-label="A tooltip"
                >
                  {getExcerptText(
                    post.channelId?.channelName,
                    deviceType == "phone" ? 30 : 50
                  )}
                </Tooltip>
              </Text>
            </Link>
          </Flex>
          <Flex>
            {!small && (
              <PostMenu
                url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post._id}`}
                title={post.header}
              />
            )}
            {showBookmarkButton && (
              <IconButton
                variant="nostyle"
                color={
                  post.isBookmarked || isbookmarkScreenCard
                    ? "green.500"
                    : "gray"
                }
                aria-label="See menu"
                fontSize="lg"
                textAlign="right"
                justifyContent="flex-end"
                p="0"
                icon={
                  post.isBookmarked || isbookmarkScreenCard ? (
                    <BookmarkFilled style={{ margin: -6 }} />
                  ) : (
                    <CiBookmark style={{ margin: -6 }} />
                  )
                }
                onClick={() => submitBookmark("post", post._id)}
              />
            )}
          </Flex>
        </Flex>
      </CardHeader>
      {!small &&
        (post.mainImageURL ? (
          <Image
            border="1px solid lightgray"
            borderRadius="md"
            objectFit="cover"
            // h="300px"
            src={post.mainImageURL}
            alt={post.header}
          />
        ) : (
          <Skeleton height="300px" mb={4} />
        ))}
      <CardBody ml="1" p="0" border="0">
        <Text
          fontSize="sm"
          pt="2"
          display="flex"
          gap="10px"
          alignItems="center"
          color="textlight"
        >
          <Flex w="100%" justify="space-between">
            <Flex
              w="100%"
              justify="flex-start"
              alignItems="flex-start"
              flexWrap="nowrap"
            >
              <Text overflow="hidden" textOverflow="ellipsis" flexShrink={1}>
                {post.section} &bull; {post.subSection} &bull;{" "}
                {formatDate(post.createdAt)} &bull; {post.readingTime} read
              </Text>
              <Flex alignItems="center" mx="2" flexShrink={0}>
                <Image src="/assets/chat-icon.png" h="1.2rem" w="1.4rem" />
                <Text ml="1">0</Text>
              </Flex>
            </Flex>

            <Box>
              {post.editionId?.pdfUrl && (
                <PdfFlipBookModal title={post.editionId?.editionText+" " +post.editionId?.editionDate } pdfFile={post.editionId.pdfUrl} />
              )}
            </Box>
          </Flex>
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

        <Link href={`/post/${post.slug}`}>
          <Heading
            py="1"
            mb="1"
            fontWeight="bold"
            fontSize="lg"
            lineHeight="2rem"
          >
            {post.header}
          </Heading>
          {post.standFirst&&<Heading
            py="1"
            mb="1"
            fontWeight="bold"
            fontSize="1.4rem"
            lineHeight="1.5rem"
          >
            {post.standFirst}
          </Heading>}
        </Link>
        <Text
          fontSize="md"
          textAlign="justify"
          dangerouslySetInnerHTML={{
            __html: getExcerptHtml(DOMPurify.sanitize(post.bodyRichText), 150),
          }}
        />
      </CardBody>
    </Card>
  );
};

export default PostCard;
