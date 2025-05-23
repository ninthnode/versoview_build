import { Box, Flex, Text, Image, Divider } from "@chakra-ui/react";
import { formatDate } from "@/app/utils/DateUtils";
import Link from "next/link";

function RelatedArticleList({ channelPosts }) {
  return (
    <Box>
      <Divider mb={4} />
      <Text fontSize="md" fontWeight="bold" mb={4}>
        MORE FROM THIS PUBLICATION
      </Text>
      <Divider mb={4} />
      {channelPosts.map((article, index) => (
        <Flex
          key={index}
          justifyContent="space-between"
          borderBottom="1px solid #e2e8f0"
          py={3}
        >
          <Flex flexDir="column" justifyContent="space-between">
          <Link href={`/post/${article.channelId.username}/${article.slug}`}>
            <Text fontSize="1.2rem" fontWeight="semibold">
              {article.header}
            </Text>
            </Link>
            <Text fontSize="sm" color="gray.600">
              {article.section} &bull; {article.subSection} &bull;{" "}
              {formatDate(article.createdAt)} &bull; {article.readingTime} read
            </Text>
          </Flex>
          <Image
            src={article.mainImageURL}
            alt={article.header}
            height="107px"
            minW="200px"
            objectFit="cover"
            ml={4}
          />
        </Flex>
      ))}
    </Box>
  );
}

export default RelatedArticleList;
