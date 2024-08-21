import React from 'react';
import { Box, Flex, Text, Avatar, IconButton, VStack } from '@chakra-ui/react';
import { FiMoreHorizontal } from 'react-icons/fi';

const rewardsData = [
  { name: 'Joel Bookzs', points: 124, avatar: 'https://via.placeholder.com/40' },
  { name: 'Colours Magazine', points: 187, avatar: 'https://via.placeholder.com/40' },
  { name: 'Sleeveface', points: 10, avatar: 'https://via.placeholder.com/40' },
  { name: 'The Economist', points: 5862, avatar: 'https://via.placeholder.com/40' },
  { name: 'Whisky Appreciation...', points: 10, avatar: 'https://via.placeholder.com/40' },
];

function RewardsList() {
  return (
    <Box>
      <Flex justifyContent="space-between" mb={4}>
        <Text fontWeight="bold" fontSize='lg'>VersoRewards</Text>
        <Text fontWeight="bold" fontSize='lg'>Points</Text>
      </Flex>
      <VStack spacing={4} align="stretch">
        {rewardsData.map((reward, index) => (
          <Flex key={index} align="center" justify="space-between" p={2} borderWidth="1px" borderRadius="md">
            <Flex align="center">
              <Avatar src={reward.avatar} name={reward.name} size="sm" mr={4} />
              <Text fontSize='md'>{reward.name}</Text>
            </Flex>
            <Flex align="center">
              <Text mr={4}>{reward.points}</Text>
              <IconButton aria-label="More options" icon={<FiMoreHorizontal />} size="sm" />
            </Flex>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default RewardsList;
