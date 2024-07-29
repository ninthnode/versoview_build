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
    <HStack spacing={4} mt="4" justify='flex-start'>
      { (
        <Link href={user.profileInstagram}>
          <IconButton fontSize='20px' color="#fff" bg="#333" icon={<FaInstagram />} />
        </Link>
      )}
      { (
        <Link href={user.profileTelegram}>
          <IconButton fontSize='20px' color="#fff" bg="#333" icon={<FaTelegram />} />
        </Link>
      )}
      { (
        <Link href={user.profileTwitter}>
          <IconButton fontSize='20px' color="#fff" bg="#333" icon={<FaTwitter />} />
        </Link>
      )}
      { (
        <Link href={user.profileFacebook}>
          <IconButton fontSize='20px' color="#fff" bg="#333" icon={<FaFacebook />} />
        </Link>
      )}
    </HStack>
  ) : (
    <VStack alignItems='flex-start'>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaInstagram />} />
        <Input
          bg='#fff'
          defaultValue={user.profileInstagram}
          placeholder="Instagram"
          onChange={(e) => instaRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaTelegram />} />
        <Input
          bg='#fff'
          defaultValue={user.profileTelegram}
          placeholder="Telegram"
          onChange={(e) => teleRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaTwitter />} />
        <Input
          bg='#fff'
          defaultValue={user.profileTwitter}
          placeholder="Twitter"
          onChange={(e) => twiRef(e.target.value)}
        />
      </HStack>
      <HStack>
        <IconButton color="#fff" bg="#333" icon={<FaFacebook />} />
        <Input
          bg='#fff'
          defaultValue={user.profileFacebook}
          placeholder="Facebook"
          onChange={(e) => faceRef(e.target.value)}
        />
      </HStack>
    </VStack>
  );

export default ShareChannel;
