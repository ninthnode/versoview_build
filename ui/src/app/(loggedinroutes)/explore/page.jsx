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
          setSearchResults(data.data || []);
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
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 text-gray-500 size-6 sm:text-sm" viewBox="0 0 24 24">
            <title>Search</title>
            <path
              fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
            />
          </svg> */}
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
            pr={7}
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
              <Link href={`/channel/${result.channelId}`} key={result.id}>
              <Flex key={result.id} py={4} my={1} rounded="md" shadow="md" bg={result.profileBgColor}>
                <Image
                  src={result.profileImageUrl || "/assets/default-post-image.svg"}
                  alt="user profile"
                  boxSize="40px"
                  rounded="full"
                  mr={3}
                />
                <Flex direction="column">
                  <Text fontWeight="bold">{result.channelName}</Text>
                  <Text fontWeight="semibold">{result.username}</Text>
                  <Text fontStyle="italic" fontWeight="thin" color="gray.500">
                    {result.email}
                  </Text>
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
