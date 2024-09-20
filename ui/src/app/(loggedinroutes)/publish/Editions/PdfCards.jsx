import React, { useEffect } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Button,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { IoAddCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { connect } from "react-redux";
import { getAllEditions } from "@/redux/publish/publishActions";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});

const PdfCards = ({ setIsCreateEditPost,setSelectedEdition, editions, getAllEditions }) => {
  const { push } = useRouter();

  useEffect(() => {
    getAllEditions();
  }, []);

  return (
    <Box w="80%">
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
          <Box
            key={index}
            boxShadow="md"
            pos="relative"
          >
            <Flex gap='2' overflow="hidden" p={2} maxW="sm" minH="200px">
            <div
                className="pdf-container"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  cursor:'pointer'
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
                <Flex justifyContent="flex-end" mt={2}>
                  <Tooltip label="Add New Post to Edition" fontSize="sm">
                    <IconButton
                      aria-label="Add New Post"
                      icon={<IoAddCircle fontSize="25px" />}
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      pos="absolute"
                      bottom="20%"
                      right="4%"
                      onClick={() => push(`/publish/post/create/${edition._id}`)}
                    />
                  </Tooltip>
                </Flex>
              </Box>
            </Flex>
            <Box flex="1" textAlign="left" p={3} borderWidth="1px" 
            cursor="pointer" onClick={() => push(`/publish/edition/${edition._id}`)}>
              {edition.editionText} {edition.editionDate}
            </Box>
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
