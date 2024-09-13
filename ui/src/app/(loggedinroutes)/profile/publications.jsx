import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Badge,
  Button,
  Stack,
  Text,
  Flex
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function Publications({ userPosts,deletePostHandler }) {
  const { push } = useRouter();
  const editPostHandler = async (id,editionId) => {
    if(editionId)
      push("/publish/post/edit/"+ id + '/'+editionId);
    else
      push("/publish/post/edit/"+id);
    };
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <AccordionButton p={2}>
          <Text fontSize="md" flex="1" textAlign="left">
            PUBLICATIONS – 3
          </Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel p={2}>
          <Accordion defaultIndex={[0]} allowMultiple p={0}>
            <AccordionItem p={0}>
              <AccordionButton p={2}>
                <Box flex="1" textAlign="left">
                  Summer 2023, June 1 2023
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel p={0}>
                <Stack spacing={0}>
                  {[
                    {
                      category: "Outdoor Living",
                      title: "The Green Room",
                      warning: true,
                    },
                    {
                      category: "Outdoor Living",
                      title: "Farm to Plate",
                      warning: true,
                    },
                    { category: "Trends", title: "Heavy Fabrics" },
                    { category: "Trends", title: "Spring Forward" },
                    {
                      category: "Style",
                      title: "7 Ways to Upgrade Your Outdoor",
                    },
                    { category: "Style", title: "Focus on the Front Yard" },
                    { category: "Travel", title: "Maldives" },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <Box>
                        <Flex>
                        <>
                        {item.warning && (
                          <Badge colorScheme="yellow" mr={2}>
                            ⚠️
                          </Badge>
                        )}
                        <Badge fontSize='12px' mr={2}>{item.category}</Badge>
                        </>
                        <Text fontSize='sm'>{item.title}</Text>
                        </Flex>
                      </Box>
                      <Button size="sm" colorScheme="red">
                        Edit
                      </Button>
                    </Box>
                  ))}
                  <Button p="0">Load next 10...</Button>
                </Stack>
              </AccordionPanel>
            </AccordionItem>

            {/* Other sections (Spring 2023, Winter 2022) would be added similarly */}
          </Accordion>
        </AccordionPanel>
      </AccordionItem>

      {/* Posts section */}
      <AccordionItem>
        <AccordionButton p={2}>
          <Text fontSize="md" flex="1" textAlign="left">
            POSTS – {userPosts ? userPosts.length : 0}
          </Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel p='0'>
          <Stack spacing={0}>
            {userPosts &&
              userPosts.map((item, index) => (
                <Flex
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  w='100%'
                >
                  <Link href={`/post/${item._id}`}>
                    <Text fontSize="sm">{item.header}</Text>
                  </Link>

                  <Flex gap={2}>
                    <Button
                      variant="default"
                      size="small"
                      bg="#FB5645"
                      py={1}
                      px={3}
                      fontWeight="light"
                      color="#fff"
                      onClick={() => editPostHandler(item._id, item.editionId)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="default"
                      size="small"
                      bg="#FB5645"
                      py={1}
                      px={3}
                      fontWeight="light"
                      color="#fff"
                      onClick={() => deletePostHandler(item._id)}
                    >
                      <MdDelete/>
                    </Button>
                  </Flex>
                </Flex>
              ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default Publications;
