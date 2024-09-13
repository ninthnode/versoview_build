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
} from "@chakra-ui/react";
import { useState } from "react";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import { useDispatch } from "react-redux";
import { createEdition } from "@/redux/publish/publishActions";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const CreateEdition = () => {
  const [pdfImage, setPdfImage] = useState("");
  const [about, setAbout] = useState("");
  const [edition, setEdition] = useState("");
  const [date, setDate] = useState("");
  const dispatch = useDispatch();

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
    if (pdfImage) {
      const defaultFileName = `pdf-${Date.now()}.pdf`;
      const fileName = defaultFileName;

      let file = await blobToFile(pdfImage, fileName);
      let content_type = file.type;
      let key = `test/pdf/${file.name}`;
      let data = { about, edition, date };

    await dispatch(createEdition(key,
         content_type, file, data));
    }
  };

  return (
    <Box p={2}>
      <Flex mt={4} justifyContent="space-between" alignItems="center" w="65%">
        <Flex alignItems="center">
          <Text fontSize="lg" mt={4} mb={4}>
            Create Edition
          </Text>
        </Flex>
        <Button fontSize="md" colorScheme="red" onClick={handleSave}>
          Save
        </Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        <Box overflow="hidden">
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
              About This Edition
            </Text>
            <Box mt="4">
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Enter details about this edition..."
                size="sm"
              />
            </Box>
            <br />
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
                Edition
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
                Date
              </FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="sm"
              />
            </FormControl>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default CreateEdition;
