import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  Avatar,
} from "@chakra-ui/react";
import { IoAddCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CiBookmark } from "react-icons/ci";
import Link from "next/link";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import { getExcerptHtml, getExcerptText } from "@/app/utils/GetExcerpt";
import DOMPurify from "dompurify";

const EditionCard = ({ edition, key, channel }) => {
  const { push } = useRouter();

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
            <Link href={`/channel/${channel._id}`}>
              <Avatar
                size="sm"
                borderRadius={10}
                src={channel.channelIconImageUrl}
              />
            </Link>
            <Link href={`/channel/${channel._id}`}>
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
              url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/post/${post._id}`}
              title={post.header}
            />
          )} */}
            {true && (
              <IconButton
                variant="nostyle"
                color={"gray"}
                aria-label="See menu"
                fontSize="lg"
                textAlign="right"
                justifyContent="flex-end"
                p="0"
                icon={<CiBookmark style={{ margin: -6 }} />}
                // onClick={() => submitBookmark("post", post._id)}
              />
            )}
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody p={1} w="100%">
      <Link href={`../edition/${edition._id}`}>
        <Box key={key} boxShadow="md" pos="relative" w="100%">
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
              <PdfViewer pdfUrl={edition.pdfUrl} size='md'/>
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
  );
};

export default EditionCard;
