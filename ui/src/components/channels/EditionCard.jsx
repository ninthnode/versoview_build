import React from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CiBookmark } from "react-icons/ci";
import { FaBookmark as BookmarkFilled } from "react-icons/fa6";
import Link from "next/link";
import { getExcerptHtml, getExcerptText } from "@/app/utils/GetExcerpt";
import DOMPurify from "dompurify";

const EditionCard = ({ edition, key, channel,submitBookmarkEdition }) => {
  
  return (
    <Box mb='4'>
    <Card maxW="2xl" mb={4} boxShadow="none">
      <CardHeader p={1}>
        <Flex
          spacing="4"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex alignItems="center" w={{ base: "220px", sm: "100%" }}>
            <Link href={`/channel/${channel.username}`}>
              <Avatar
                size="sm"
                borderRadius={10}
                src={channel.channelIconImageUrl}
              />
            </Link>
            <Link href={`/channel/${channel.username}`}>
              <Text ml="2" fontWeight="semibold" fontSize="md">
                <Tooltip label={channel?.channelName} aria-label="A tooltip">
                  {getExcerptText(channel?.channelName)}
                </Tooltip>
              </Text>
            </Link>
          </Flex>
          <Flex>
            {/* {!small && (
            <PostMenu
              url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post.slug}`}
              title={post.header}
            />
          )} */}
            {true && (
               <IconButton
                variant="nostyle"
                color={
                  edition.isBookmarked
                    ? "green.500"
                    : "gray"
                }
                aria-label="See menu"
                fontSize="lg"
                textAlign="right"
                justifyContent="flex-end"
                p="0"
                icon={
                  edition.isBookmarked ? (
                    <BookmarkFilled style={{ margin: -6 }} />
                  ) : (
                    <CiBookmark style={{ margin: -6 }} />
                  )
                }
                onClick={() => submitBookmarkEdition("edition", edition._id)}
              />
            )}
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody p={1} w="100%">
      <Link href={`../edition/${edition._id}`}>
        <Box key={key} pos="relative" w="100%">
          <Flex gap="2" overflow="hidden" minH="200px">
            <div
              className="pdf-container"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Image src={edition.libraryImages[0]} alt="pdf" />
            </div>
            <Box w="100%" pt='3'>
            <Text
              fontSize="md"
              textAlign="justify"
              dangerouslySetInnerHTML={{
                __html: getExcerptHtml(DOMPurify.sanitize(edition.editionDescription), 150),
              }}
            />
            </Box>
          </Flex>
        </Box>
        </Link>
      </CardBody>
    </Card>
    <Divider/>
    </Box>
  );
};

export default EditionCard;
