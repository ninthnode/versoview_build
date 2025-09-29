"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Image,
  HStack,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { suspendChannel, reactivateChannel } from "@/redux/channel/channelActions";
import Link from "next/link";

const AdminDashboard = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingChannels, setProcessingChannels] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChannels: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const user = useSelector(state => state.auth.user?.user);
  const dispatch = useDispatch();
  const router = useRouter();

  // Check if user is admin
  const isAdmin = user && user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  useEffect(() => {
    if (!isAdmin && user) {
      router.push('/home');
      return;
    }
    if (isAdmin) {
      fetchChannels(1);
    }
  }, [isAdmin, user, router]);

  const fetchChannels = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token")?.replace(/"/g, "");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/channel/adminDashboard`,
        {
          params: { page, limit: 20 },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 200) {
        setChannels(response.data.data.channels);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to fetch channel data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchChannels(newPage);
    }
  };

  const handleChannelStatusChange = async (channelId, currentStatus) => {
    try {
      setProcessingChannels(prev => new Set([...prev, channelId]));

      if (currentStatus === 'suspended') {
        await dispatch(reactivateChannel(channelId));
        // Update local state immediately
        setChannels(prevChannels =>
          prevChannels.map(channel =>
            channel._id === channelId
              ? { ...channel, status: 'active' }
              : channel
          )
        );
      } else {
        await dispatch(suspendChannel(channelId));
        // Update local state immediately
        setChannels(prevChannels =>
          prevChannels.map(channel =>
            channel._id === channelId
              ? { ...channel, status: 'suspended' }
              : channel
          )
        );
      }
    } catch (error) {
      console.error(`Error ${currentStatus === 'suspended' ? 'reactivating' : 'suspending'} channel:`, error);
      setError(`Failed to ${currentStatus === 'suspended' ? 'reactivate' : 'suspend'} channel`);
    } finally {
      setProcessingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAdmin && user) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Box>
    );
  }

  if (loading && pagination.currentPage === 1) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          Admin Dashboard
        </Heading>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardHeader pb={2}>
              <Heading size="sm">Total Channels</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Stat>
                <StatNumber fontSize="2xl">{pagination.totalChannels}</StatNumber>
                <StatHelpText>All channels in the system</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* <Card>
            <CardHeader pb={2}>
              <Heading size="sm">Current Page</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Stat>
                <StatNumber fontSize="2xl">
                  {pagination.currentPage} / {pagination.totalPages}
                </StatNumber>
                <StatHelpText>Page navigation</StatHelpText>
              </Stat>
            </CardBody>
          </Card> */}

          <Card>
            <CardHeader pb={2}>
              <Heading size="sm">Active Channels</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Stat>
                <StatNumber fontSize="2xl">
                  {channels.filter(ch => ch.status === 'active').length}
                </StatNumber>
                <StatHelpText>On current page</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}


        {/* Channels Table */}
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Channel Management
          </Heading>

          {loading ? (
            <Flex justify="center" p={6}>
              <Spinner />
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Channel</Th>
                    <Th>Owner</Th>
                    <Th>Username</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th minW="120px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {channels.map((channel) => (
                    <Tr key={channel._id}>
                      <Td>
                        <Link href={`/channel/${channel.userId?.username}`}>
                          <HStack cursor="pointer" _hover={{ bg: "gray.50" }} p={2} rounded="md">
                            <Image
                              src={channel.channelIconImageUrl || "/assets/default-post-image.svg"}
                              alt={channel.channelName}
                              boxSize="40px"
                              rounded="md"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" color="blue.600" _hover={{ textDecoration: "underline" }}>
                                {channel.channelName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {channel.channelId}
                              </Text>
                            </VStack>
                          </HStack>
                        </Link>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text>
                            {channel.userId?.firstName} {channel.userId?.lastName}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {channel.userId?.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontFamily="mono">@{channel.userId?.username}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            channel.status === 'active' ? 'green' :
                            channel.status === 'suspended' ? 'red' : 'gray'
                          }
                        >
                          {channel.status || 'unknown'}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {formatDate(channel.createdAt)}
                        </Text>
                      </Td>
                      <Td minW="120px">
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme={channel.status === 'suspended' ? 'green' : 'red'}
                            variant="solid"
                            isLoading={processingChannels.has(channel._id)}
                            onClick={() => handleChannelStatusChange(channel._id, channel.status)}
                            disabled={!channel.userId}
                            minW="90px"
                          >
                            {channel.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalChannels)} of{" "}
            {pagination.totalChannels} channels
          </Text>

          <HStack>
            <Button
              leftIcon={<FaChevronLeft />}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={!pagination.hasPrevPage || loading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            <Text fontSize="sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>

            <Button
              rightIcon={<FaChevronRight />}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              isDisabled={!pagination.hasNextPage || loading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;