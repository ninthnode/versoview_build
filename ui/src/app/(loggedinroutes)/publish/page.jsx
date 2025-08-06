"use client";
import React, { useState } from "react";
import PublishPost from "./post/create/page";
import PdfCards from "./Editions/PdfCards";
import Posts from "./Editions/Posts";
import useDeviceType from "@/components/useDeviceType";
import {
  Box,
  Divider,
  Flex,
} from "@chakra-ui/react";
function Publish() {
  const deviceType = useDeviceType();
  const [isCreateEditPost, setIsCreateEditPost] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState([]);
  return (
    <Box mt='4' px={{ base: 2, md: 4 }}>
      {deviceType == "desktop" && !isCreateEditPost ? (
        <Flex 
          gap={{ base: 2, md: 4 }} 
          direction={{ base: "column", lg: "row" }}
          px={{ base: 2, md: 4 }}
        >
          <PdfCards 
            setIsCreateEditPost={setIsCreateEditPost}
            setSelectedEdition={setSelectedEdition}
          />
          <Posts 
            setIsCreateEditPost={setIsCreateEditPost}
            setSelectedEdition={setSelectedEdition}
          />
        </Flex>
      ) : (
        <PublishPost/>
      )}
    </Box>
  );
}

export default Publish;
