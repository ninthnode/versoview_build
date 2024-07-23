import { Text, VStack, Input } from "@chakra-ui/react";
import get from "@/app/utils/get";
import useSWR from "swr";

const ChannelName = ({
  channelName,
  setChannelName,
  defaultValue,
  isEditing,
}) => {
  const { data: { data: exists } = { data: "" } } = useSWR(
    `channel/doesChannelExist/${channelName}`,
    get
  );

  return !isEditing ? (
    <Text fontWeight="bold">{defaultValue}</Text>
  ) : (
    <VStack>
      <Input
        placeholder="@channel"
        defaultValue={defaultValue}
        onBlur={(e) => {
          setChannelName(e.target.value);
        }}
        value={channelName}
        isInvalid={!!exists}
        errorBorderColor="crimson"
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
