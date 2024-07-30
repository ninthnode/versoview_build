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
import { useSelector } from "react-redux";
import axios from "../../../redux/axiosConfig";
import dynamic from "next/dynamic";
import "@shoelace-style/shoelace/dist/themes/light.css";
// import "react-image-picker-editor/dist/index.css";
// import ReactImagePickerEditor from "react-image-picker-editor";
import UploadImage from "@/components/UploadImage";
import useSWR from "swr";
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

const getUser = (id) =>
  axios
    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getUser/${id}`, {
      headers: {
        authorization: `Bearer ${localStorage
          .getItem("token")
          .replaceAll('"', "")}`,
      },
    })
    .then((r) => r.data);

const updateUser = (id, data) =>
  axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/updateUser/${id}`,
    data,
    {
      headers: {
        authorization: `Bearer ${localStorage
          .getItem("token")
          .replaceAll('"', "")}`,
      },
    }
  );

function Profile() {
  const authState = useSelector((s) => s.auth?.user?.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const [bg, setBG] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
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

  const { data: user = {}, mutate } = useSWR("user", () =>
    getUser(authState.id)
      .then((r) => r.user)
      .then((u) => {
        !isEditing && setBG(u.profileBgColor);
        return u;
      })
  );

  const onEditSubmit = () => {
    const data = {
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
      // ...(img ? { profileImageUrl: img } : {}),
    };
    setUpdating(true);
    updateUser(authState.id, data)
      .then(async (r) => {
        console.log({ "updated user": r.data.user });
        mutate(r.data.user);
        setUpdating(false);
        setIsEditing(false);
      })
      .catch((e) => setUpdating(false));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    setGenre(user.genre);
    setSubGenre(user.subGenre);
  }, [user]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Box ml="4" mb="60px" maxW="2xl">
      <Flex w="100%" justifyContent="flex-end">
        <Button leftIcon={<MdLogout />} variant="ghost" onClick={handleLogout}>
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
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
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
          spacing={4}
          bg="#f4f4f4"
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
                <SlButton variant="default" size="small" onClick={onEditSubmit}>
                  <SlIcon slot="prefix" name="check2" />
                  Save
                </SlButton>
              )
            ) : (
              <SlButton
                variant="default"
                size="small"
                onClick={() => setIsEditing(true)}
              >
                <SlIcon slot="prefix" name="pen" />
                Edit
              </SlButton>
            )}
          </Box>
          <Box w="100%" textAlign="left">
            <Text fontSize="lg" fontWeight="bold" textAlign="left">
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
              <Text>{user.totalPosts?user.totalPosts:0}</Text>
              <Text>Post</Text>
            </Box>
            <Box>
              <Text>7</Text>
              <Text>Editions</Text>
            </Box>
            <Box>
              <Text>7</Text>
              <Text>Articles</Text>
            </Box>
            <Box>
              <Text>{user.channelFollowings?user.channelFollowings:0}</Text>
              <Text>Followings</Text>
            </Box>
            <Box>
              <Text>{user.channelFollowers?user.channelFollowers:0}</Text>
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
            <Flex gap={4}>
              <Text fontWeight="bold">Genre</Text>
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
              <Text fontWeight="bold">Subgenre</Text>
              {isEditing ? (
                <Input
                  bg="#fff"
                  on
                  defaultValue={user.subGenre?.join(",")}
                  placeholder="Comma-Separated"
                  onChange={(e) =>
                    setSubGenre(e.target.value.split(",").map((i) => i.trim()))
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
              <Text fontSize="2xl" fontWeight="bold">
                Profile:
              </Text>
              <ChannelName
                defaultValue={user.channelName}
                isEditing={isEditing}
                channelName={channelName}
                setChannelName={setChannelName}
              />
            </Flex>
            <Flex w="100%" gap={4} flexDirection={isEditing ? "column" : "row"}>
              Name
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
            <Text>
              URL:{" "}
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
            </Text>
            <Text>
              Email:{" "}
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
            </Text>
            <Text>
              Location:{" "}
              {isEditing ? (
                <Input
                  bg="#fff"
                  onChange={(e) => setLocation(e.target.value)}
                  defaultValue={user.profileLocation}
                />
              ) : (
                <span>{user.profileLocation}</span>
              )}
            </Text>
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
  );
}

export default Profile;
