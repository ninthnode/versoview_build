import { Flex,Skeleton, SkeletonCircle, Box } from "@chakra-ui/react";

const AvatarShimmer = () => {
  return (
    <Box overflowX="scroll"
    overflowY="hidden" __css={{
        "&::-webkit-scrollbar": {
          w: "2",
          h: "1",
        },
        "&::-webkit-scrollbar-track": {
          w: "6",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10",
          bg: "gray.100",
        },
      }}>
      <Flex gap={4}>
      {[...Array(6)].map((_, i) => (
        <Box key={i} textAlign="center">
          <SkeletonCircle size="60px" />
          <Skeleton height="10px" mt={2} width="50px" />
        </Box>
      ))}
      </Flex> 
    </Box>
  );
};

export default AvatarShimmer;
