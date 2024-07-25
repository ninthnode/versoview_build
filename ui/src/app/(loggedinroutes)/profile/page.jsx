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
  Button
} from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";
import axios from "../../../redux/axiosConfig";
import dynamic from "next/dynamic";
import "@shoelace-style/shoelace/dist/themes/light.css";
// import "react-image-picker-editor/dist/index.css";
// import ReactImagePickerEditor from "react-image-picker-editor";

import useSWR from "swr";
import ChannelName from "./channel-name";
import ShareChannel from "./share-channel";

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

const naImage =
  "https://via.assets.so/img.svg?w=100&h=100&tc=darkgray&bg=gray&t=N/A";

const uploadToS3 = async (i) => i;

// const UploadImage = memo(({ defaultImage, setImage }) => (
//   <ReactImagePickerEditor
//     config={{
//       borderRadius: "8px",
//       language: "en",
//       width: "80px",
//       height: "80px",
//       objectFit: "cover",
//       compressInitial: 0.5,
//       hideEditBtn: true,
//       hideDownloadBtn: true,
//       hideAddBtn: true,
//     }}
//     imageSrcProp={defaultImage}
//     imageChanged={(newDataUri) => {
//       uploadToS3(newDataUri).then((img) => setImage(img));
//     }}
//   />
// ));

function Profile() {
  const authState = useSelector((s) => s.auth?.user?.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const [bg, setBG] = useState();
  const [img, setImg] = useState();
  const [about, setAbout] = useState();
  const [genre, setGenre] = useState([]);
  const [subGenre, setSubGenre] = useState([]);
  const [url, setUrl] = useState();
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

      profileBgColor: bg,
      ...(user.newImage ? { profileImageUrl: user.newImage } : {}),
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
    window.location.href='/login'
  }

  return (
    <Box ml="4" 
        maxW="2xl">
      <Flex w='100%' justifyContent='flex-end'>
        <Button leftIcon={<MdLogout/>} variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bgColor={bg}
        p={5}
      >
        <HStack justify={"space-between"} align={"flex-start"}>
          {isEditing ? (
            {/* <UploadImage
              defaultImage={user.profileImageUrl || naImage}
              setImage={setImg}
            /> */}
          ) : (
            <Image
              src={user.profileImageUrl || naImage}
              alt="Home Beautiful"
              boxSize="80px"
              objectFit="cover"
            />
          )}
          <SlColorPicker
            disabled={!isEditing}
            label="Select a color"
            // defaultValue={user.profileBgColor}
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

        <VStack spacing={4} bg="#fff" p="2" borderRadius="md" textAlign="left">
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
          <Box textAlign="left">
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
          <Divider h="2px" bg="#333" />
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
          <Divider h="2px" bg="#333" />
          <Box textAlign="left" w="100%">
            <Text fontWeight="bold">Genre</Text>
            {isEditing ? (
              <Input
                defaultValue={user.genre?.join(",")}
                placeholder="Comma-Separated"
                onChange={(e) =>
                  setGenre(e.target.value.split(",").map((i) => i.trim()))
                }
              />
            ) : (
              <Text>{user.genre?.join(" & ")}</Text>
            )}
            <Text fontWeight="bold">Subgenre</Text>
            {isEditing ? (
              <Input
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
            <Text fontWeight="bold">Profile</Text>
            <ChannelName
              defaultValue={user.channelName}
              isEditing={isEditing}
              channelName={channelName}
              setChannelName={setChannelName}
            />
            <Text>
              URL:{" "}
              {isEditing ? (
                <Input
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
                  onChange={(e) => setLocation(e.target.value)}
                  defaultValue={user.profileLocation}
                />
              ) : (
                <span>{user.profileLocation}</span>
              )}
            </Text>
          </Box>
          <Divider h="2px" bg="#333" />
          <Box textAlign="left" w="100%">
            <Text fontWeight="bold">Publications - 3</Text>
            <Box>
              <Text>Special update: Festival Happiness</Text>
              <Text>Competition: Win our featured cushions</Text>
              <Text>30% Off Offer: Warm tapestry sales</Text>
              <Text>Working article: Mats or runners?</Text>
              <Text>Special update: Easter around the corner</Text>
              <Text>Competition: Win this Swedish cooker</Text>
              <Text>Open Days: Royal HNL common space</Text>
            </Box>
          </Box>
          <Divider h="2px" bg="#333" />
          <Box textAlign="left" w="100%">
            <Text fontWeight="bold">VersoRewards</Text>
            <Box>
              <Text>Joel Books: 124 points</Text>
              <Text>Colors Magazine: 187 points</Text>
              <Text>Sleeve face: 10 points</Text>
              <Text>The Economist: 5,862 points</Text>
              <Text>Whisky Appreciation: 10 points</Text>
              <Text>Underdog Collectibles: 560 points</Text>
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default Profile;
