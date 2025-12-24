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
  Divider,
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
import { openCommentModal } from "@/redux/comments/commentAction";

const PdfFlipBookModal = dynamic(
  () => import("@/components/posts/PdfFlipBookModal"),
  {
    ssr: false,
  }
);
import { useDispatch } from "react-redux";

const PostCard = ({
  post,
  title,
  small = false,
  showBookmarkButton = true,
  submitBookmark,
  isbookmarkScreenCard = false,
}) => {
  const deviceType = useDeviceType();
  const dispatch = useDispatch();

  const handleRedirectToPost = async (id) => {
    dispatch(openCommentModal(id, "post"));
  };
  return (
    <Box>
      <Card mb={4} boxShadow="none" px={4}>
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
                  url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post.channelId?.username}/${post.slug}`}
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
              // minH={{ base: "250px", md: "300px"}}
              aspectRatio="360/205"
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
                  {post.section} {post.section && "●"} {post.subSection}{" "}
                  {post.subSection && "●"} {formatDate(post.createdAt)} &bull;{" "}
                  {post.readingTime} read
                </Text>
                <div
                  onClick={() => {
                    handleRedirectToPost(post.slug);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Link href={`/post/${post.channelId.username}/${post.slug}`}>
                    <Flex alignItems="center" mx="2" flexShrink={0}>
                      <Image
                        src="/assets/chat-icon.png"
                        h="1.2rem"
                        w="1.4rem"
                      />
                      <Text ml="1">{post.commentCount}</Text>
                    </Flex>
                  </Link>
                </div>
              </Flex>

              <Box>
                {post.editionId?.pdfUrls?.length > 0 && (
                  <PdfFlipBookModal
                    title={
                      post.editionId?.editionText +
                      " " +
                      post.editionId?.editionDate
                    }
                    editionId={post.editionId._id}
                  />
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

          <Link href={`/post/${post.channelId.username}/${post.slug}`}>
            <Heading
              py="1"
              mb="1"
              fontWeight="bold"
              fontSize="lg"
              lineHeight="2rem"
            >
              {post.header}
            </Heading>
            {post.standFirst && (
              <Text
                py="1"
                mb="1"
                fontWeight="bold"
                fontSize="1.4rem"
                lineHeight="1.5rem"
              >
                {post.standFirst}
              </Text>
            )}
          </Link>
          <Text
            fontSize="md"
            textAlign="left"
            dangerouslySetInnerHTML={{
              __html: getExcerptHtml(
                DOMPurify.sanitize(post.bodyRichText),
                150
              ),
            }}
          />
        </CardBody>
      </Card>
      <Divider />
    </Box>
  );
};

export default PostCard;
