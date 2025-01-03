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
} from "@chakra-ui/react";
import { IoAddCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { connect } from "react-redux";
import { getAllEditions } from "@/redux/publish/publishActions";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import useConfirmationDialog from "@/components/useConfirmationDialog";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { deletePost } from "@/redux/posts/postActions";
import { deleteEdition } from "@/redux/publish/publishActions";
import { useDispatch, useSelector } from "react-redux";

const PdfCards = ({
  setIsCreateEditPost,
  setSelectedEdition,
  editions,
  getAllEditions,
}) => {
  const { push } = useRouter();
  const dispatch = useDispatch();
  
  const [showDialog, ConfirmationDialogComponent] = useConfirmationDialog(
    "Are you sure you want to delete this edition?"
  );

  const [showDialogPost, ConfirmationDialogComponentPost] = useConfirmationDialog(
    'Are you sure you want to delete this post?'
  );
  useEffect(() => {
    getAllEditions();
  }, []);
  const editPostHandler = async (id,editionId) => {
    if(editionId)
      push("/publish/post/edit/"+ id + '/'+editionId);
    else
      push("/publish/post/edit/"+id);
    };
    const deletePostHandler = async (id) => {
      const confirmed = await showDialogPost();
      if (confirmed) {
        await dispatch(deletePost(id));
        dispatch(getAllEditions())
      }
    };
    const deleteEditionHandler = async (id) => {
      const confirmed = await showDialog();
      if (confirmed) {
        await dispatch(deleteEdition(id));
        dispatch(getAllEditions())
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
                <PdfViewer pdfUrl={edition.pdfUrl} />
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
            <Flex justifyContent="center">
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
            </Flex>
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
                  zIndex="9999"
                  w="100%"
                  borderWidth="2px"
                >
                  {edition.postId.length <= 0 && (
                    <Text fontSize="sm">Post not found!</Text>
                  )}
                  {edition.postId.map((item, i) => (
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
    </Box>
  );
};

const mapStateToProps = (state) => ({
  editions: state.publish.editions,
});

const mapDispatchToProps = (dispatch) => ({
  getAllEditions: () => dispatch(getAllEditions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PdfCards);
