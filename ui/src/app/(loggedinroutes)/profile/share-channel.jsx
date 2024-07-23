import {
  Flex,
  Image,
  Heading,
  Divider,
  Text,
  HStack,
  IconButton,
  Link,
  TabPanel,
  Box,
  VStack,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FaInstagram, FaTelegram, FaTwitter, FaFacebook } from "react-icons/fa";

const ShareChannel = ({
  isEditing = false,
  user = {},
  instaRef,
  teleRef,
  twiRef,
  faceRef,
}) =>
  !isEditing ? (
    <HStack spacing={4} mt="4">
      {user.profileInstagram && (
        <Link href={user.profileInstagram}>
          <IconButton color="#fff" bg="#333" icon={<FaInstagram />} />
        </Link>
      )}
      {user.profileTelegram && (
        <Link href={user.profileTelegram}>
          <IconButton color="#fff" bg="#333" icon={<FaTelegram />} />
        </Link>
      )}
      {user.profileTwitter && (
        <Link href={user.profileTwitter}>
          <IconButton color="#fff" bg="#333" icon={<FaTwitter />} />
        </Link>
      )}
      {user.profileFacebook && (
        <Link href={user.profileFacebook}>
          <IconButton color="#fff" bg="#333" icon={<FaFacebook />} />
        </Link>
      )}
    </HStack>
  ) : (
    <VStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaInstagram />} />
        <Input
          defaultValue={user.profileInstagram}
          placeholder="Instagram"
          onChange={(e) => instaRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaTelegram />} />
        <Input
          defaultValue={user.profileTelegram}
          placeholder="Telegram"
          onChange={(e) => teleRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaTwitter />} />
        <Input
          defaultValue={user.profileTwitter}
          placeholder="Twitter"
          onChange={(e) => twiRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaFacebook />} />
        <Input
          defaultValue={user.profileFacebook}
          placeholder="Facebook"
          onChange={(e) => faceRef(e.target.value)}
        />
      </HStack>
    </VStack>
  );

export default ShareChannel;
