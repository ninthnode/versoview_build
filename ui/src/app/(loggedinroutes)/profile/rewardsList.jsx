import React,{useState,useEffect} from 'react';
import { Box, Flex, Text, Avatar, IconButton, VStack } from '@chakra-ui/react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useDispatch,useSelector } from "react-redux";
import { getUserRewardsPoints } from "@/redux/profile/actions";

function RewardsList({userId}) {
  const dispatch = useDispatch();
  const [userRewards, setUserRewards] = useState([]);
  const userRewardsRedux = useSelector((s) => s.profile.userRewards);
  const [totalPoints, setTotalPoints] = useState(0);

useEffect(() => {
  if(userId)
  dispatch(getUserRewardsPoints(userId));
}, [userId]);
useEffect(() => {
  if(userRewardsRedux){
    const totalPoints = userRewardsRedux.reduce((total, user) => total + user.points, 0);
    setTotalPoints(totalPoints);
    setUserRewards(userRewardsRedux);
  }
}, [userRewardsRedux]);

  return (
    <Box>
      <Flex justifyContent="space-between" mb={4}>
        <Text fontWeight="bold" fontSize='lg'>VersoRewards</Text>
        <Text fontWeight="bold" fontSize='lg'>Points: {totalPoints}</Text>
      </Flex>
      <VStack spacing={4} align="stretch">
        {userRewards&&userRewards.map((reward, index) => (
          <Flex key={index} align="center" justify="space-between" p={2} borderWidth="1px" borderRadius="md">
            <Flex align="center">
              <Avatar src={reward.avatar} name={reward.name} size="sm" mr={4} />
              <Text fontSize='md'>{reward.name}</Text>
            </Flex>
            <Flex align="center">
              <Text mr={4}>{reward.points}</Text>
              {/* <IconButton aria-label="More options" icon={<FiMoreHorizontal />} size="sm" /> */}
            </Flex>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default RewardsList;
