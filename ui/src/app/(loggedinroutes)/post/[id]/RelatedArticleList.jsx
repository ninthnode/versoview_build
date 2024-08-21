import { Box, Flex, Text, Image, Divider } from "@chakra-ui/react";

const articles = [
  {
    title: "Adventurine",
    category: "Travel – Style",
    date: "Oct 21",
    readTime: "1 min read",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    title: "Pretty in Pink",
    category: "Travel – Style",
    date: "Oct 21",
    readTime: "1 min read",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    title: "Travel – Inspire",
    category: "Travel – Inspire",
    date: "Oct 20",
    readTime: "4 min read",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    title: "Where the stars kiss the ocean",
    category: "Travel – Maldives",
    date: "Aug 21",
    readTime: "6 min read",
    imageUrl: "https://via.placeholder.com/150",
    comments: 68,
  },
];

function RelatedArticleList() {
  return (
    <Box>
    <Divider mb={4}/>
      <Text fontSize="md" fontWeight="bold" mb={4}>
        MORE FROM THIS PUBLICATION
      </Text>
      <Divider mb={4}/>
      {articles.map((article, index) => (
        <Flex key={index} justifyContent='space-between' borderBottom="1px solid #e2e8f0" py={3}>
          <Flex flexDir='column' justifyContent='space-between'>
            <Text fontSize="23px" fontWeight="semibold">
              {article.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {article.category} • {article.date} • {article.readTime}
            </Text>
          </Flex>
          <Image src={article.imageUrl} alt={article.title} boxSize="80px" objectFit="cover" ml={4} />
        </Flex>
      ))}
    </Box>
  );
}

export default RelatedArticleList;
