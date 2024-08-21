import { Text, VStack, Input } from "@chakra-ui/react";
import get from "@/app/utils/get";
import { useEffect, useState } from "react";

const ChannelName = ({
  channelName,
  setChannelName,
  defaultValue,
  isEditing,
}) => {


  return !isEditing ? (
    <Text fontWeight="bold" fontSize="md">{'@'+defaultValue}</Text>
  ) : (
    <VStack>
      <Input
        bg='#fff'
        placeholder="@channel"
        defaultValue={defaultValue}
        onBlur={(e) => {
          setChannelName(e.target.value);
        }}
        value={channelName}
        w='100%'
        disabled
      />
    </VStack>
  );
};

export default ChannelName;
