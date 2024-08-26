import { Box, Skeleton, Stack } from "@chakra-ui/react";

const PostCardShimmer = () => {
  return (
    <Box border="1px solid #e2e8f0" borderRadius="md" p={4} width="full">
      <Skeleton height="200px" mb={4} />
      <Stack spacing={3}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" width="70%" />
      </Stack>
    </Box>
  );
};

export default PostCardShimmer;
    