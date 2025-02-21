"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
  } from "@chakra-ui/react";
  import Dms from "./dms";
import Chats from "../chats";
import { useSelector } from "react-redux";

function MassagesPage() {
      const [tabIndex, setTabIndex] = useState(0);
      const authState = useSelector((s) => s.auth?.user?.user);

  return (
    <div>
       <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList gap={2} h="3rem" borderColor='lightgray' display={{ base: "flex", md: "none" }}>
          <Tab pl="0">Dms</Tab>
          <Tab pl="1">Chats</Tab>
        </TabList>
        <TabPanels p="0">
          <TabPanel p="0">
          <Dms />
          </TabPanel>
          <TabPanel p="0">
          <Box mt='2' mb='20px'>
            <Chats user={authState}/>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default MassagesPage
