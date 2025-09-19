"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Select, Box, Spinner, Flex, Image, Text,Divider } from "@chakra-ui/react";
import PostCard from "../home/postCard";
import { addRemoveBookmarks } from "@/redux/bookmarks/bookmarkAction";
import { useDispatch } from "react-redux";
import Link from "next/link";

const Search = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("articles");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search) {
      const fetchData = async () => {
        setIsSearching(true);
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/search/${category}/${search}`);
          const results = data.data || [];

          // Additional frontend filter to exclude suspended channels (as safety measure)
          const filteredResults = results.filter(result => {
            if (category === "articles") {
              return result.channelId && result.channelId.status !== 'suspended';
            } else if (category === "users") {
              // Users without active channels should already be filtered by backend
              return true;
            }
            return true;
          });

          setSearchResults(filteredResults);
        } catch (error) {
          // console.error("Error fetching search results", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };

      fetchData();
    }
    else{
      setSearchResults([])
    }
  }, [search, category]);

  const submitBookmarkPost = async (type, postId) => {
    const res = await dispatch(addRemoveBookmarks(type, postId));
    const updatedData = { isBookmarked: res.data.isBookmarked };
    setSearchResults((prevItems) =>
      prevItems.map((item) =>
        item._id === res.data.postId ? { ...item, ...updatedData } : item
      )
    );
  };

  return (
    <Box mt={2}>
      <Box position="relative" mt={1} rounded="md" shadow="sm">
        <Flex position="absolute" insetY="0" left="0" align="center" pl={3} pointerEvents="none">
        </Flex>
        <Input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          pr='30%'
          bg="gray.100"
          rounded="md"
          borderColor="gray.300"
          focusBorderColor="indigo.500"
        />
        <Flex position="absolute" insetY="0" right="0" zIndex='9999' align="center">
          <Select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            pl={2}
            py={0}
            h="full"
            bg="transparent"
            borderColor="transparent"
            focusBorderColor="indigo.500"
            variant="outline"
          >
            <option value="articles">Articles</option>
            <option value="users">Users</option>
          </Select>
        </Flex>
      </Box>
      <Box mt={2}>
        {isSearching ? (
          <Flex justify="center" mt={10}>
            <Spinner />
          </Flex>
        ) : null}
        {searchResults.length > 0 ? (
          searchResults.map((result) =>
            category === "articles" ? (
              <>
              <PostCard submitBookmark={submitBookmarkPost} small={true} post={result} key={result._id} />
              <Divider/>
              </>
            ) : (
              <Link href={`/channel/${result.username}`} key={result.id}>
              <Flex key={result.id} py={4} px={2} my={1} rounded="md" shadow="md" 
              // bg={result.profileBgColor}
              >
                <Image
                  src={result.profileImageUrl || "/assets/default-post-image.svg"}
                  alt="user profile"
                  boxSize="40px"
                  rounded="md"
                  mr={3}
                />
                <Flex direction="column">
                  <Text fontWeight="bold">{result.channelName}</Text>
                  <Text fontWeight="semibold">{result.username}</Text>
                  {/* <Text fontStyle="italic" fontWeight="thin" color="gray.500">
                    {result.email}
                  </Text> */}
                </Flex>
              </Flex>
              </Link>
            )
          )
        ) : (
          search && !isSearching ? <Text>No results matched your search</Text>:<Text>Type to Search...</Text>
        )}
      </Box>
    </Box>
  );
};

export default Search;
