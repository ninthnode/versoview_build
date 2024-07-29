"use client";

import React, { useState } from "react";
import PostCard from "../home/postCard";
import useSWR from "swr";
import get from "@/app/utils/get";
import { Spinner } from "@chakra-ui/react";

const Search = () => {
  const [search, setSearch] = useState();
  const [category, setCategory] = useState("articles");

  const {
    data: { data: searchResults } = { data: [] },
    isLoading: isSearching,
  } = useSWR(`search/${category}/${search}`, get, {
    revalidateOnMount: false,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  return (
    <div className="px-5 mt-2 divide-y-2">
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mt-1 text-gray-500 size-6 sm:text-sm"
            viewBox="0 0 24 24"
          >
            <title>Search</title>
            <path
              fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
            />
          </svg>
        </div>
        <input
          type="text"
          name="price"
          id="price"
          className="block py-4 pr-12 pl-12 w-full bg-gray-100 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="@channel"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex absolute inset-y-0 right-0 items-center">
          <select
            id="currency"
            name="currency"
            className="py-0 pr-7 pl-2 h-full text-gray-500 bg-transparent rounded-md border-transparent focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="articles">Articles</option>
            <option value="users">Users</option>
            {/* <option value="messages">💬 Chats</option> */}
          </select>
        </div>
      </div>
      <div className="container mt-2 space-y-4 divider-y-2">
        {isSearching ? (
          <Spinner className="container self-center mt-10" />
        ) : null}
        {searchResults?.length
          ? searchResults.map((result) =>
              category === "articles" ? (
                <PostCard small={true} post={result} key={result._id} />
              ) : (
                <div
                  key={result.id}
                  className="container flex p-4 my-1 rounded shadow"
                  style={{backgroundColor: result.profileBgColor}}
                >
                  <div className="flex flex-start">
                    <img
                      src={
                        result.profileImageUrl || "/assets/default-post-image.svg"
                      }
                      alt="userprofile img"
                      className="m-1 mr-3 rounded-full size-10"
                    />
                    <div className="flex flex-col">
                      <div className="font-bold">{result.channelName}</div>
                      <div class="font-semibold">{result.username}</div>
                      <div class="italic font-thin text-gray-500">
                        {result.email}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          : search && !isSearching && <p>No results matched your search</p>}
      </div>
    </div>
  );
};

export default Search;
