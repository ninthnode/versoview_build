"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Text, Flex, Container,Image } from '@chakra-ui/react';
import { useSelector } from "react-redux";

const TopicSelection = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [error, setError] = useState(false);
  const authState = useSelector((s) => s.auth.user.user);
  const token = localStorage.getItem("token").replaceAll('"', "");;
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/genre/getAllGenre`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        const genreNames = response.data.data.map(topic => topic.genreName);
        setTopics(genreNames);
      })
      .catch(error => {
        console.error('Error fetching topics:', error);
      });
  }, []);

  const handleTopicClick = (topic) => {
    setSelectedTopics(prevSelectedTopics => {
      const newSelectedTopics = new Set(prevSelectedTopics);
      if (newSelectedTopics.has(topic)) {
        newSelectedTopics.delete(topic);
      } else {
        newSelectedTopics.add(topic);
      }
      return newSelectedTopics;
    });
  };

  const handleSubmit = () => {
    const selectedTopicsArray = Array.from(selectedTopics);
    const formData ={}
    formData.genre = selectedTopicsArray;
    if(selectedTopicsArray.length<3)
      return setError(true)
    else
    setError(false)
    axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/updateUser/${authState.id}`, formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ContentType: 'application/json',
        },
      })
      .then(response => {
        console.log('User topics updated:', response.data);
        window.location.href = '/home';
      })
      .catch(error => {
        console.error('Error updating user topics:', error);
      });
  };

  return (
    <>
    <Flex bg="secondary" p={10} justify="center">
        <Image src={"/assets/desktop-logo.svg"} alt="desktopLogo" />
      </Flex>
    <Container maxW='xl'>
    <Box p={4} textAlign='center'>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Welcome</Text>
      <Text mb={4}>Choose three or more topics which interest you</Text>
      {error&&<Text mb={4} color='red'>Choose atleast three or more topics</Text>}
      <Flex wrap="wrap" gap={4}>
      {topics.length>0 && topics.map((topic, index) => (
          <Button
            key={index}
            colorScheme={selectedTopics.has(topic) ? 'blue' : 'gray'}
            onClick={() => handleTopicClick(topic)}
          >
            {topic}
          </Button>
        ))}
      </Flex>
      <Button mt={4} colorScheme={Array.from(selectedTopics).length<3?"gray":"blue"} onClick={()=>{Array.from(selectedTopics).length<3?"":handleSubmit()}}>Enter</Button>
    </Box>
    </Container>
    </>
  );
};

export default TopicSelection;
