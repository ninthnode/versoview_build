import React, { useEffect } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Button,
  IconButton,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
} from "@chakra-ui/react";
import { IoAddCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { connect } from "react-redux";
import { getAllEditions } from "@/redux/publish/publishActions";
import dynamic from "next/dynamic";
import useConfirmationDialog from "@/components/useConfirmationDialog";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { deletePost } from "@/redux/posts/postActions";
import { deleteEdition } from "@/redux/publish/publishActions";

const PdfCards = ({ editions, getAllEditions, deletePost, deleteEdition }) => {
  const { push } = useRouter();

  const [showDialog, ConfirmationDialogComponent] = useConfirmationDialog(
    "Are you sure you want to delete this edition?"
  );

  const [showDialogPost, ConfirmationDialogComponentPost] =
    useConfirmationDialog("Are you sure you want to delete this post?");
  useEffect(() => {
    getAllEditions();
  }, []);
  const editPostHandler = async (id, editionId) => {
    if (editionId) push("/publish/post/edit/" + id + "/" + editionId);
    else push("/publish/post/edit/" + id);
  };
  const deletePostHandler = async (id) => {
    const confirmed = await showDialogPost();
    if (confirmed) {
      await deletePost(id);
      getAllEditions();
    }
  };
  const deleteEditionHandler = async (id) => {
    const confirmed = await showDialog();
    if (confirmed) {
      await deleteEdition(id);
      getAllEditions();
    }
  };
  return (
    <Box w="80%">
      {ConfirmationDialogComponent}
      {ConfirmationDialogComponentPost}
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="lg" mt={4} mb={4}>
          PDFs
        </Text>
        <Button
          rightIcon={<IoAddCircle color="green" fontSize="27px" />}
          fontSize="sm"
          mt={4}
          mb={4}
          display="flex"
          onClick={() => push("/publish/edition/create-edition")}
        >
          Create Edition
        </Button>
      </Flex>
      {editions.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {editions.map((edition, index) => (
            <Box key={index} boxShadow="md" pos="relative">
              <Flex gap="2" overflow="hidden" p={2} maxW="sm" minH="200px">
                <div
                  className="pdf-container"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => push(`/publish/edition/${edition._id}`)}
                >
                  <Image src={edition?.firstImage} alt="PDF" />
                </div>
                <Box w="100%">
                  <Text fontSize="sm" noOfLines={3}>
                    {edition.editionDescription}
                  </Text>
                  <br />
                </Box>
              </Flex>
              <Flex justifyContent="center">
                <Button
                  aria-label="Add New Post"
                  rightIcon={<IoAddCircle fontSize="25px" />}
                  size="sm"
                  textAlign="center"
                  variant="ghost"
                  colorScheme="green"
                  maxW="250px"
                  whiteSpace="wrap"
                  onClick={() => push(`/publish/post/create/${edition._id}`)}
                >
                  Add a post from this edition
                </Button>
              </Flex>
              {/* <Flex justifyContent="center">
                <Button
                  aria-label="Add New Post"
                  rightIcon={<MdDelete fontSize="25px" />}
                  size="sm"
                  textAlign="center"
                  variant="ghost"
                  colorScheme="red"
                  onClick={async () => deleteEditionHandler(edition._id)}
                >
                  Delete edition
                </Button>
              </Flex> */}
              <Accordion allowToggle allowMultiple={false} mt={4}>
                <AccordionItem key={edition._id}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      {edition.editionText} {edition.editionDate}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={4}
                    pos="absolute"
                    bg={"white"}
                    w="100%"
                    borderWidth="2px"
                    zIndex="99"
                  >
                    {edition?.postId.length <= 0 && (
                      <Text fontSize="sm">Post not found!</Text>
                    )}
                    {edition?.postId.map((item, i) => (
                      <Flex
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        w="100%"
                      >
                        <Link href={`/post/${item.channelId.username}/${item.slug}`}>
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
                            onClick={() =>
                              editPostHandler(item._id, item.editionId)
                            }
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
                            <MdDelete />
                          </Button>
                        </Flex>
                      </Flex>
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Flex justify="center" align="center" height="200px">
          <Text fontSize="sm" fontWeight="bold" color="gray.500">
            No editions found
          </Text>
        </Flex>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({
  editions: state.publish.editions,
});

const mapDispatchToProps = (dispatch) => ({
  getAllEditions: () => dispatch(getAllEditions()),
  deletePost: (id) => dispatch(deletePost(id)),
  deleteEdition: (id) => dispatch(deleteEdition(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PdfCards);
