import { Text, VStack, Input } from "@chakra-ui/react";
import get from "@/app/utils/get";
import useSWR from "swr";
import { useEffect, useState } from "react";

const ChannelName = ({
  channelName,
  setChannelName,
  defaultValue,
  isEditing,
}) => {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    get(`channel/doesChannelExist/${channelName}`).then((r) => {
      if (r.data) setExists(true);
      else setExists(false);
    });
  }, [channelName]);

  return !isEditing ? (
    <Text fontWeight="bold">{'@'+defaultValue}</Text>
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
        isInvalid={!!exists}
        errorBorderColor="crimson"
        w='100%'
      />
      {exists && (
        <small className="text-xs text-red-600">
          @{channelName} is already taken !
        </small>
      )}
    </VStack>
  );
};

export default ChannelName;
