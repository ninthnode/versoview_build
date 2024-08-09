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
} from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, updateUser } from "@/redux/profile/actions";
import dynamic from "next/dynamic";
import "@shoelace-style/shoelace/dist/themes/light.css";
import UploadImage from "@/components/UploadImage";
import ChannelName from "./channel-name";
import ShareChannel from "./share-channel";
import Publications from "./publications";
import RewardsList from "./rewardsList";

const SlColorPicker = dynamic(
  () => import("@shoelace-style/shoelace/dist/react/color-picker/index.js"),
  {
    ssr: false,
  }
);

const SlSpinner = dynamic(
  () => import("@shoelace-style/shoelace/dist/react/spinner/index.js"),
  {
    ssr: false,
  }
);

const SlButton = dynamic(
  () => import("@shoelace-style/shoelace/dist/react/button/index.js"),
  {
    ssr: false,
  }
);

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react/icon/index.js"),
  {
    ssr: false,
  }
);

function Profile() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth?.user?.user);
  const profileState = useSelector((state) => state.profile);
  const { loading, user, error } = profileState;

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
  const [location, setLocation] = useState();
  const [twitter, setTwitter] = useState();
  const [instagram, setInstagram] = useState();
  const [facebook, setFacebook] = useState();
  const [telegram, setTelegram] = useState();
  const [channelName, setChannelName] = useState();

  useEffect(() => {
    dispatch(fetchUser(authState.id));
  }, [authState]);

  useEffect(() => {
    if (user) {
      setBG(user.profileBgColor);
      setGenre(user.genre);
      setSubGenre(user.subGenre);
      setAbout(user.profileAbout);
      setUsername(user.username);
      setEmail(user.email);
      setLocation(user.profileLocation);
      setTwitter(user.profileTwitter);
      setInstagram(user.profileInstagram);
      setFacebook(user.profileFacebook);
      setTelegram(user.profileTelegram);
      setChannelName(user.channelName);
      setUrl(user.profileUrl);
      setSelectedImage(user.profileImageUrl)
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
    let content_type = null
    let key = null
    if(uploadImage){
      content_type = uploadImage.type;
      key = `test/image/${uploadImage.name}`;
    }
    dispatch(updateUser(key, content_type, uploadImage, authState.id, dataObj))
      .then(() => {
        setUpdating(false);
        setIsEditing(false);
        setUploadImage(null);
      })
      .catch(() => setUpdating(false));
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
  return (
    user && (
      <Box ml={{ base: "0", sm: "4" }} mb="60px" maxW="xl">
        <Flex w="100%" justifyContent="flex-end">
          <Button
            leftIcon={<MdLogout />}
            variant="ghost"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
        <Box
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
            <SlColorPicker
              disabled={!isEditing}
              label="Select a color"
              value={bg}
              onSlInput={(e) => {
                setBG(e.target.value);
              }}
              size="small"
              swatches="
                #d0021b; #f5a623; #f8e71c; #8b572a; #7ed321; #417505; #bd10e0; #9013fe;
                #4a90e2; #50e3c2; #b8e986; #000; #444; #888; #ccc; #fff;
              "
            />
          </HStack>

          <VStack
            spacing={3}
            bg="#F5F5F5"
            p="4"
            borderRadius="md"
            textAlign="left"
            alignItems="normal"
          >
            <Box alignSelf="end">
              {isEditing ? (
                isUpdating ? (
                  <SlSpinner />
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
                  py={2}
                  px={3}
                  fontWeight="light"
                  color="#fff"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Box w="100%" textAlign="left">
              <Text pb={2} fontSize="xl" fontWeight="bold" textAlign="left">
                About
              </Text>

              {isEditing ? (
                <Textarea
                  defaultValue={user.profileAbout}
                  onChange={(e) => setAbout(e.target.value)}
                />
              ) : (
                <Text fontSize="sm">{user.profileAbout}</Text>
              )}
            </Box>
            <Flex spacing={2} gap={4} w="60%" justify="flex-start">
              <Box>
                <Text>{user.totalPosts ? user.totalPosts : 0}</Text>
                <Text>Posts</Text>
              </Box>
              <Box>
                <Text>0</Text>
                <Text>Editions</Text>
              </Box>
              <Box>
                <Text>0</Text>
                <Text>Articles</Text>
              </Box>
              <Box>
                <Text>
                  {user.channelFollowings ? user.channelFollowings : 0}
                </Text>
                <Text>Following</Text>
              </Box>
              <Box>
                <Text>{user.channelFollowers ? user.channelFollowers : 0}</Text>
                <Text>Followers</Text>
              </Box>
            </Flex>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <Text fontSize="lg" fontWeight="bold">
                Share Channel
              </Text>
              <ShareChannel
                isEditing={isEditing}
                instaRef={setInstagram}
                teleRef={setTelegram}
                twiRef={setTwitter}
                faceRef={setFacebook}
                user={user}
              />
            </Box>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <Flex gap={10}>
                <Text fontSize="md">Genre</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    defaultValue={user.genre?.join(",")}
                    placeholder="Comma-Separated"
                    onChange={(e) =>
                      setGenre(e.target.value.split(",").map((i) => i.trim()))
                    }
                  />
                ) : (
                  <Text>{user.genre?.join(" & ")}</Text>
                )}
              </Flex>
              <Flex gap={4}>
                <Text fontSize="md">Subgenre</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    on
                    defaultValue={user.subGenre?.join(",")}
                    placeholder="Comma-Separated"
                    onChange={(e) =>
                      setSubGenre(
                        e.target.value.split(",").map((i) => i.trim())
                      )
                    }
                  />
                ) : (
                  <Text>{user.subGenre?.join(" & ")}</Text>
                )}
              </Flex>
            </Box>
            <Divider h="1px" bg="#333" />
            <Box>
              <Flex w="100%" gap={4} alignItems="center">
                <Text fontSize="xl" fontWeight="bold">
                  Profile:
                </Text>
                <ChannelName
                  defaultValue={user.channelName}
                  isEditing={isEditing}
                  channelName={channelName}
                  setChannelName={setChannelName}
                />
              </Flex>
              <Flex
                w="100%"
                gap="14%"
                flexDirection={isEditing ? "column" : "row"}
              >
                <Text fontSize="md">Name</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setUsername(e.target.value)}
                    defaultValue={user.username}
                  />
                ) : (
                  <Text>{user.username}</Text>
                )}
              </Flex>
              <Flex
                w="100%"
                gap="14%"
                flexDirection={isEditing ? "column" : "row"}
              >
                <Text fontSize="md">URL:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setUrl(e.target.value)}
                    defaultValue={user.profileUrl}
                  />
                ) : (
                  <Link href={user.profileUrl} isExternal>
                    {user.profileUrl}
                  </Link>
                )}
              </Flex>
              <Flex
                w="100%"
                gap="14%"
                flexDirection={isEditing ? "column" : "row"}
              >
                <Text fontSize="md">Email:</Text>
                {isEditing ? (
                  <Input
                    bg="#fff"
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={user.email}
                  />
                ) : (
                  <Link href={`mailto:${user.email}`} isExternal>
                    {user.email}
                  </Link>
                )}
              </Flex>
              <Flex
                w="100%"
                gap="14%"
                flexDirection={isEditing ? "column" : "row"}
              >
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
              </Flex>
            </Box>
            <Divider h="1px" bg="#333" />
            <Text fontSize="lg" fontWeight="bold">
              Library
            </Text>
            <Box textAlign="left" w="100%">
              <Publications userPosts={user.posts} />
            </Box>
            <Divider h="1px" bg="#333" />
            <Box textAlign="left" w="100%">
              <RewardsList />
            </Box>
          </VStack>
        </Box>
      </Box>
    )
  );
}

export default Profile;
