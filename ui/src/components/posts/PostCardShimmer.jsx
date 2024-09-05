import { Box, Skeleton, Stack } from "@chakra-ui/react";

const PostCardShimmer = () => {
  return (
    <>
    {[...Array(3)].map((_, i) => (
    <Box key={i} py={4} maxWidth="2xl">
      <Skeleton height="30px" mb={2} />
      <Skeleton height="300px" mb={4} />
      <Stack spacing={3}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" width="70%" />
      </Stack>
    </Box>
    ))}
    </>
  );
};

export default PostCardShimmer;
    