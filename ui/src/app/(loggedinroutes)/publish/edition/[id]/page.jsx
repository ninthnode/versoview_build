"use client"
import { useEffect } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Image,
  Text,
  Button,
  Stack,
  Badge,
} from "@chakra-ui/react";
import { IoAddCircle } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { getEditionById } from "@/redux/publish/publishActions";
import { useDispatch,useSelector } from "react-redux";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import { useRouter } from "next/navigation";
import { deletePost } from "@/redux/posts/postActions";
import useConfirmationDialog from "@/components/useConfirmationDialog"

const SingleEdition = ({params}) => {
  const dispatch = useDispatch();
  const singleEdition = useSelector((state) => state.publish.singleEdition)
  const postData = useSelector((state) => state.publish.singleEditionPosts)
  const { push } = useRouter();
  const [showDialog, ConfirmationDialogComponent] = useConfirmationDialog(
    'Are you sure you want to delete this post?'
  );
  useEffect(() => {
    dispatch(getEditionById(params.id))
  }, [])
  const editPostHandler = async (id,editionId) => {
  if(editionId)
    push("/publish/post/edit/"+ id + '/'+editionId);
  else
    push("/publish/post/edit/"+id);
  };

  const deletePostHandler = async (id) => {
    const confirmed = await showDialog();
    if (confirmed) {
      await dispatch(deletePost(id));
      dispatch(getEditionById(params.id))
    }
  };
  
  return singleEdition&&(
    <Box mt='4'>
      <Flex justifyContent="space-between" alignItems="center">
      {ConfirmationDialogComponent}
        <Flex alignItems="center">
          <Text fontSize="lg" mt={4} mb={4}>
          {singleEdition.editionText} {singleEdition.editionDate}
          </Text>
          <Button
            leftIcon={<FaEdit fontSize="25px" color="green" />}
            fontSize="md"
            ml='4'
          >
            Edit
          </Button>
        </Flex>
        <Button
          leftIcon={<IoAddCircle fontSize="25px" color="green"/>}
          fontSize="md"
          onClick={() => push(`/publish/post/create/${singleEdition._id}`)}
        >
          Add New Post
        </Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }}>
        <Box overflow="hidden" p={2}>
          <Box
            borderTopWidth="2px"
            borderBottomWidth="2px"
            borderColor="gray.300"
          >
            <Text fontSize="mdl" fontWeight="bold" mt={3} mb={3}>
              PDF
            </Text>
          </Box>
          <Box borderBottomWidth="2px" borderColor="gray.300">
            <PdfViewer pdfUrl={singleEdition.pdfUrl}/>
          </Box>

          <Box px="2" py="4">
            <Text textTransform="uppercase" fontSize="mdl" fontWeight="bold">
              About This Edition
            </Text>
            <Box mt="4">
              <Text fontSize="sm">
                {singleEdition.editionDescription}
              </Text>
            </Box>
            <br />
          </Box>
        </Box>
        <Box overflow="hidden" p={2}>
          <Box
            borderTopWidth="2px"
            borderBottomWidth="2px"
            borderColor="gray.300"
          >
            <Text fontSize="mdl" fontWeight="bold" mt={3} mb={3}>
              EDITION DETAILS
            </Text>
          </Box>

          <Box mt="4">
            <Text
              textTransform="uppercase"
              fontSize="md"
              fontWeight="bold"
              py="2"
            >
              Edition
            </Text>
            <Text fontSize="sm">{singleEdition.editionText} {singleEdition.editionDate}</Text>
            <Text
              textTransform="uppercase"
              fontSize="md"
              fontWeight="bold"
              py="2"
            >
              Date
            </Text>
            <Text fontSize="sm">{singleEdition.editionDate}</Text>
          </Box>
        </Box>
        <Box p={2}>
          <Box
            borderTopWidth="2px"
            borderBottomWidth="2px"
            borderColor="gray.300"
          >
            <Text fontSize="mdl" fontWeight="bold" mt={3} mb={3}>
              Posts
            </Text>
          </Box>
          <Stack spacing={0} mt="4">
          {postData.length===0 && <Text fontSize="sm">No posts found</Text>}
          {postData &&
          postData.map((item, index) => (
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
                  <MdDelete />
                </Button>
              </Flex>
            </Flex>
          ))}
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default SingleEdition;