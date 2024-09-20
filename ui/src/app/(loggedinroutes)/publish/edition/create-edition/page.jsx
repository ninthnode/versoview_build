"use client";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import { useDispatch, useSelector } from "react-redux";
import { createEdition } from "@/redux/publish/publishActions";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { fetchUser } from "@/redux/profile/actions";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import genres from "@/static-data/genres";

const CreateEdition = () => {
  const [pdfImage, setPdfImage] = useState("");
  const [about, setAbout] = useState("");
  const [edition, setEdition] = useState("");
  const [date, setDate] = useState("");
  const dispatch = useDispatch();
  const [channelName, setChannelName] = useState();
  const [userGenres, setUserGenres] = useState([]);
  const [genre, setGenre] = useState([]);
  const [subGenre, setSubGenre] = useState([]);
  const profileState = useSelector((state) => state.profile);
  const { user } = profileState;
  const authState = useSelector((state) => state.auth?.user?.user);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      let tempUserGenres = [];
      user.genre.forEach(selectedGenre => {
        const genreObj = genres.find(g => g.genre === selectedGenre);
  
        if (genreObj) {
          tempUserGenres = [...tempUserGenres, {genre: selectedGenre, subGenres: genreObj.subGenres}];
        }
      });
      setUserGenres(tempUserGenres);
      setGenre(user.genre);
      setChannelName(user.channelName);
    }
  }, [user]);
  const handlePdfSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a PDF file.");
    }
  };

  async function blobToFile(blobUrl, fileName) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });

    return file;
  }

  const handleSave = async () => {
    if (!pdfImage || !about || !date|| !genre) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mandatory * fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (pdfImage) {
      const defaultFileName = `pdf-${Date.now()}.pdf`;
      const fileName = defaultFileName;

      let file = await blobToFile(pdfImage, fileName);
      let content_type = file.type;
      let key = `test/pdf/${file.name}`;
      let data = { about, edition, date,genre,subGenre };

      await dispatch(createEdition(key, content_type, file, data));
    }
  };

  useEffect(() => {
    if (authState) dispatch(fetchUser(authState.id));
  }, [authState]);
  useEffect(() => {
    let newSubgenres = [];

    genre.forEach(selectedGenre => {
      const genreObj = userGenres.find(g => g.genre === selectedGenre);

      if (genreObj) {
        newSubgenres = [...newSubgenres, ...genreObj.subGenres];
      }
    });

    newSubgenres = [...new Set(newSubgenres)]
    setSubGenre(newSubgenres);
  }, [genre]); 
  return (
    <Box p={2}>
      <Flex mt={4} justifyContent="space-between" alignItems="center" w="65%">
        <Flex alignItems="center">
          <Text fontSize="lg" mt={4} mb={4}>
            Create Edition
          </Text>
        </Flex>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        <Box overflow="hidden">
          <Box
            borderTopWidth="2px"
            borderBottomWidth="2px"
            borderColor="gray.300"
          >
            <Text fontSize="mdl" fontWeight="bold" mt={3} mb={3}>
              PDF*
            </Text>
          </Box>
          <Box borderBottomWidth="2px" borderColor="gray.300">
            {/* PDF Image display */}
            {pdfImage && (
              <div
                className="pdf-container"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <PdfViewer pdfUrl={pdfImage} />
              </div>
            )}
            {/* PDF Selection Input */}
            <Input
              p={2}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              mt={2}
            />
          </Box>

          <Box px="2" py="4">
            <Text textTransform="uppercase" fontSize="mdl" fontWeight="bold">
              About This Edition*
            </Text>
            <Box mt="4">
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Enter details about this edition..."
                size="sm"
                minH="xs"
              />
            </Box>
            <br />
          </Box>
        </Box>
        <Box overflow="hidden" minH="500px">
          <Box
            borderTopWidth="2px"
            borderBottomWidth="2px"
            borderColor="gray.300"
          >
            <Text fontSize="mdl" fontWeight="bold" mt={3} mb={3}>
              PUBLICATION DETAILS
            </Text>
          </Box>

          <Box textAlign="left" w="100%">
            <FormControl mt="4">
              <FormLabel
                textTransform="uppercase"
                fontSize="md"
                fontWeight="bold"
                py="2"
              >
                Publication
              </FormLabel>
              <Input
                value={channelName}
                isDisabled
                size="sm"
              />
            </FormControl>
            <Box mt="4">
              <FormControl mt="4">
                <FormLabel
                  textTransform="uppercase"
                  fontSize="md"
                  fontWeight="bold"
                  py="2"
                  w="100%"
                >
                  Genre*
                </FormLabel>
              </FormControl>
                <MultiSelectDropdown
                  selectedOptions={genre}
                  setGenre={setGenre}
                  options={userGenres}
                  placeholder={"Select genres"}
                />
            </Box>
            <Box mt="4">
              <FormControl mt="4">
                <FormLabel
                  textTransform="uppercase"
                  fontSize="md"
                  fontWeight="bold"
                  py="2"
                >
                  Subgenre
                </FormLabel>
                <Textarea
                value={subGenre?.join(" , ")}
                size="sm"
                isDisabled
                rows='4'
              />
              </FormControl>
            </Box>
          </Box>
        </Box>
        <Box overflow="hidden">
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
            <FormControl>
              <FormLabel
                textTransform="uppercase"
                fontSize="md"
                fontWeight="bold"
                py="2"
              >
                Edition*
              </FormLabel>
              <Input
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="Enter the edition name"
                size="sm"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel
                textTransform="uppercase"
                fontSize="md"
                fontWeight="bold"
                py="2"
              >
                Date*
              </FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="sm"
              />
            </FormControl>
          </Box>
          <Button mt='8' w='full' fontSize="md" colorScheme="red" onClick={handleSave}>
          Save
        </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default CreateEdition;
