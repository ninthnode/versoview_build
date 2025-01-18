import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Text, Flex } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "@/redux/posts/postActions";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { deletePost } from "@/redux/posts/postActions";
import useConfirmationDialog from "@/components/useConfirmationDialog"

function Posts() {
  const dispatch = useDispatch();
  const userPosts = useSelector((s) => s.post.posts);
  const { push } = useRouter();
  const [showDialog, ConfirmationDialogComponent] = useConfirmationDialog(
    'Are you sure you want to delete this post?'
  );
  useEffect(() => {
    dispatch(fetchPosts());
  }, []);

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
        dispatch(fetchPosts())
      }
    };
    
  return (
    <Box pl="4" minW='sm' borderLeftWidth="1px" borderColor="lightgray">
      <Flex alignItems='center' justifyContent='space-between'>
      {ConfirmationDialogComponent}
      <Text fontSize="lg" mt={4} mb={4}>
        Posts 
      </Text>
      <Button
      onClick={() => push(`/publish/post/create`)} rightIcon={<IoAddCircle color='green' fontSize='27px'/>} fontSize="sm" mt={4} mb={4} display='flex'>
        Create Post
      </Button>
      </Flex>
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
  );
}

export default Posts;
