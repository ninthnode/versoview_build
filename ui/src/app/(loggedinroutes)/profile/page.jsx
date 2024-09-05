"use client";

import React, { memo, useEffect, useRef, useState } from "react";
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
  Button,
  Spinner,
  Grid,
} from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, updateUser } from "@/redux/profile/actions";
import { deletePost } from "@/redux/posts/postActions";
import dynamic from "next/dynamic";
import UploadImage from "@/app/(loggedinroutes)/profile/UploadImage";
import ChannelName from "./channel-name";
import ShareChannel from "./share-channel";
import Publications from "./publications";
import RewardsList from "./rewardsList";
import genres from "@/static-data/genres";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import useConfirmationDialog from "@/components/useConfirmationDialog"
import ShareButton from "@/components/posts/ShareButton";

function Profile() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth?.user?.user);
  const profileState = useSelector((state) => state.profile);
  const { loading, user, error } = profileState;

  const [showDialog, ConfirmationDialogComponent] = useConfirmationDialog(
    'Are you sure you want to delete this post?'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const [bg, setBG] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);
  const [about, setAbout] = useState();
  const [genre, setGenre] = useState([]);
  const [subGenre, setSubGenre] = useState([]);
  const [url, setUrl] = useState();
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [location, setLocation] = useState();
  const [twitter, setTwitter] = useState();
  const [instagram, setInstagram] = useState();
  const [facebook, setFacebook] = useState();
  const [telegram, setTelegram] = useState();
  const [channelName, setChannelName] = useState();

  useEffect(() => {
    if (authState) dispatch(fetchUser(authState.id));
  }, [authState]);

  useEffect(() => {
    if (user) {
      setBG(user.profileBgColor);
      setGenre(user.genre);
      setSubGenre(user.subGenre);
      setAbout(user.profileAbout);
      setUsername(user.username);
      setEmail(user.email);
      setPhone(user.profilePhone);
      setLocation(user.profileLocation);
      setTwitter(user.profileTwitter);
      setInstagram(user.profileInstagram);
      setFacebook(user.profileFacebook);
      setTelegram(user.profileTelegram);
      setChannelName(user.channelName);
      setUrl(user.profileUrl);
      setSelectedImage(user.profileImageUrl);
    }
  }, [user]);

  const onEditSubmit = () => {
    const dataObj = {
      ...user,
      profileAbout: about,
      genre: genre,
      subGenre: subGenre,
      profileUrl: url,
      profileEmail: email,
      profilePhone: phone,
      profileLocation: location,
      profileInstagram: instagram,
      profileTelegram: telegram,
      profileTwitter: twitter,
      profileFacebook: facebook,
      email: email,
      channelName: channelName,
      username: username,
      profileBgColor: bg,
    };
    setUpdating(true);
    let content_type = null;
    let key = null;
    if (uploadImage) {
      content_type = uploadImage.type;
      key = `test/image/${uploadImage.name}`;
    }
    dispatch(updateUser(key, content_type, uploadImage, authState.id, dataObj))
      .then((r) => {
        setUpdating(false);
        setIsEditing(false);
        setUploadImage(null);
        dispatch(fetchUser(authState.id));
      })
      .catch((e) => {
        console.log(e);
        setUpdating(false);
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadImage(file);
      setSelectedImage(file);
    }
  };
  const deletePostHandler = async (id) => {
    const confirmed = await showDialog();
    if (confirmed) {
      await dispatch(deletePost(id));
      dispatch(fetchUser(authState.id));
    }
  };
  
  useEffect(() => {
    // Initialize a new array for subgenres
    let newSubgenres = [];

    // Iterate over the selected genres
    genre.forEach(selectedGenre => {
      // Find the genre in the genres array
      const genreObj = genres.find(g => g.genre === selectedGenre);

      // If the genre is found, add its subgenres to the newSubgenres array
      if (genreObj) {
        newSubgenres = [...newSubgenres, ...genreObj.subGenres];
      }
    });

    // Remove duplicates from newSubgenres array
    newSubgenres = [...new Set(newSubgenres)]
    // Set the new subgenre array
    setSubGenre(newSubgenres);
  }, [genre]); 
  
  return (
    user && (
      <Box bg="#F5F5F5" ml={{ base: "0", sm: "4" }} mb="60px" maxW="xl">
        {ConfirmationDialogComponent}
        <Box
          mt={2}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bgColor={bg}
          p={4}
        >
          <HStack justify={"space-between"} align={"flex-start"} mb="4">
            <UploadImage
              handleImageChange={handleImageChange}
              selectedImage={selectedImage}
              uploadImage={uploadImage}
              isEditing={isEditing}
            />
            <input
              type="color"
              style={{
                appearance: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid #4C9C8A",
                padding: "4px",
                backgroundColor: "#fff",
                cursor: !isEditing ? "not-allowed" : "pointer",
              }}
              value={bg}
              onChange={(e) => {
                setBG(e.target.value);
              }}
              disabled={!isEditing}
              variant="flushed"
              placeholder="Pick a color"
            />
          </HStack>

          <VStack
            spacing={3}
            bg="#fff"
            p="4"
            borderRadius="md"
            textAlign="left"
            alignItems="normal"
          >
            <Box w="100%" textAlign="left">
              <Flex justifyContent="space-between" alignItems="start" mb="2">
                <Text fontSize="lg" fontWeight="bold" textAlign="left">
                  About
                </Text>
                <Box alignSelf="end">
                  {isEditing ? (
                    isUpdating ? (
                      <Spinner />
                    ) : (
                      <Button
                        variant="default"
                        size="small"
                        bg="#FB5645"
                        py={2}
                        px={3}
                        fontWeight="light"
                        color="#fff"
                        onClick={onEditSubmit}
                      >
                        Save
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="default"
                      size="small"
                      bg="#FB5645"
                      py={1}
                      px={3}
                      fontWeight="light"
                      color="#fff"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </Flex>

              {isEditing ? (
                <Textarea
                  defaultValue={user.profileAbout}
                  onChange={(e) => setAbout(e.target.value)}
                  maxLength="250"
                  fontSize="md"
                />
              ) : (
                <Text fontSize="md">{user.profileAbout}</Text>
              )}
            </Box>
            <Flex
              flexWrap="wrap"
              spacing={2}
              gap={2}
              w="100%"
              justify="flex-start"
            >
              <Box>
                <Text fontSize="sm">
                  {user.totalPosts ? user.totalPosts : 0}
                </Text>
                <Text fontSize="xs">Posts</Text>
              </Box>
              <Box>
                <Text fontSize="sm">0</Text>
                <Text fontSize="xs">Editions</Text>
              </Box>
              <Box>
                <Text fontSize="sm">0</Text>
                <Text fontSize="xs">Articles</Text>
              </Box>
              <Box>
                <Text fontSize="sm">
                  {user.channelFollowings ? user.channelFollowings : 0}
                </Text>
                <Text fontSize="xs">Following</Text>
              </Box>
              <Box>
                <Text fontSize="sm">
                  {user.channelFollowers ? user.channelFollowers : 0}
                </Text>
                <Text fontSize="xs">Followers</Text>
              </Box>
            </Flex>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <Text fontSize="lg" fontWeight="bold" mb="2">
                Share Channel
              </Text>
              {user && (
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/channel/${user.channelId}`}
                  title={user.channelName}
                  shareButton={true}
                />
              )}
            </Box>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <Flex gap={10}>
                <Text fontSize="md">Genre</Text>
                {isEditing ? (
                  <MultiSelectDropdown
                    selectedOptions={genre}
                    setGenre={setGenre}
                    options={genres}
                    placeholder={"Select genres"}
                  />
                ) : (
                  <Text fontSize="sm">{user.genre?.join(" & ")}</Text>
                )}
              </Flex>
              <Flex gap={2}>
                <Text fontSize="md">Subgenre</Text>
                {/* {isEditing ? (
                  <Input
                    bg="#fff"
                    on
                    defaultValue={subGenre?.join(",")}
                    placeholder="Comma-Separated"
                     fontSize="sm"
                    onChange={(e) =>
                      setSubGenre(
                        e.target.value.split(",").map((i) => i.trim())
                      )
                    }
                  />
                ) : ( */}
                <Text
                  fontSize="sm"
                  fontWeight="normal"
                  h="fit-content"
                  maxW="100%"
                  textOverflow="ellipsis"
                  whiteSpace="normal"
                  p={2}
                >
                  {subGenre?.join(" , ")}
                </Text>
                {/* )} */}
              </Flex>
            </Box>
            <Divider h="1px" bg="#333" />
            <Box>
              <Grid templateColumns="auto 1fr" columnGap={10} rowGap={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Profile:
                </Text>
                <ChannelName
                  defaultValue={user.channelName}
                  isEditing={isEditing}
                  channelName={channelName}
                  setChannelName={setChannelName}
                />

                <Text fontSize="md">Name:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setUsername(e.target.value)}
                    defaultValue={user.username}
                  />
                ) : (
                  <Text fontSize="md">{user.username}</Text>
                )}

                <Text fontSize="md">URL:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setUrl(e.target.value)}
                    defaultValue={user.profileUrl}
                  />
                ) : (
                  <Text fontSize="md">
                    <Link href={user.profileUrl} isExternal>
                      {user.profileUrl}
                    </Link>
                  </Text>
                )}

                <Text fontSize="md">Email:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={user.email}
                  />
                ) : (
                  <Text fontSize="md">
                    <Link href={`mailto:${user.email}`} isExternal>
                      {user.email}
                    </Link>
                  </Text>
                )}
                <Text fontSize="md">Phone:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setPhone(e.target.value)}
                    defaultValue={user.profilePhone}
                    type="number"
                  />
                ) : (
                  <Text fontSize="md">
                    <Link href={`tel:${user.profilePhone}`} isExternal>
                      {user.profilePhone}
                    </Link>
                  </Text>
                )}

                <Text fontSize="md">Location:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setLocation(e.target.value)}
                    defaultValue={user.profileLocation}
                  />
                ) : (
                  <span>{user.profileLocation}</span>
                )}
              </Grid>
            </Box>
            <Divider h="1px" bg="#333" />
            <Text fontSize="lg" fontWeight="bold">
              Library
            </Text>
            <Box textAlign="left" w="100%">
              <Publications
                userPosts={user.posts}
                deletePostHandler={deletePostHandler}
              />
            </Box>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <RewardsList />
            </Box>
          </VStack>
        </Box>
        <Flex w="100%" justifyContent="flex-end">
          <Button
            mr="2"
            my="2"
            leftIcon={<MdLogout />}
            bg="#fff"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Box>
    )
  );
}

export default Profile;
