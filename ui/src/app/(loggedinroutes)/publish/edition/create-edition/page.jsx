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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  useDisclosure,
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
import DemographicForm from "./DemographicForm";

import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [progress, setProgress] = useState(null);
  const [currentText, setCurrentText] = useState(
    "Please Be patient this might take some time..."
  );

  const [uploadedPdf, setUploadedPdf] = useState(null);

  const uploadSteps = useSelector((state) => state.publish.uploadSteps);
  const uploadProgress = useSelector((state) => state.publish.uploadProgress);

  useEffect(() => {
    if (uploadProgress > 0) {
      setProgress(uploadProgress);
      if (uploadSteps == 1) setCurrentText("Step 1: Uploading PDF");
      if (uploadSteps == 2) setCurrentText("Step 2: Uploading Images");
    }
  }, [uploadProgress, uploadSteps]);
  useEffect(() => {
    if (user) {
      let tempUserGenres = [];
      user.genre.forEach((selectedGenre) => {
        const genreObj = genres.find((g) => g.genre === selectedGenre);

        if (genreObj) {
          tempUserGenres = [
            ...tempUserGenres,
            { genre: selectedGenre, subGenres: genreObj.subGenres },
          ];
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

  async function blobToFile(blobOrUrl, fileName) {
    let blob;

    if (typeof blobOrUrl === "string") {
      const response = await fetch(blobOrUrl);
      blob = await response.blob();
    } else if (blobOrUrl instanceof Blob) {
      blob = blobOrUrl;
    } else {
      throw new Error("Invalid input: must be a Blob or a URL string");
    }

    const file = new File([blob], fileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
    return file;
  }

  const handleSave = async () => {
    if (!pdfImage || !about || !date || !genre) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mandatory * fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    // Step 1: Upload PDF
    onOpen();

    if (pdfImage) {
      const defaultFileName = `pdf-${Date.now()}.pdf`;
      const fileName = defaultFileName;

      let file = await blobToFile(pdfImage, fileName);
      const chunks = await dividePdfFileIntoChunks(file, 10);

      const chunkPdfFiles = await Promise.all(
        chunks.map(async ({ chunk, startPage, endPage }, index) => {
          const fileName = `${startPage}-to-${endPage}` + Date.now() + ".pdf";
          const blob = new Blob([chunk], { type: "application/pdf" });
          const blobFile = await blobToFile(blob, fileName);
          return blobFile;
        })
      );

      let data = { about, edition, date, genre, subGenre };
      setUploadedPdf(file);

      // Step 2: Upload Library Images
      let capturedPdfImages = [];

      if (file) {
        try {
          const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          // Function to render a single page as an image
          const renderPage = async (pageNum, scale = 1) => {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render the page to the canvas
            await page.render({ canvasContext: context, viewport }).promise;

            return new Promise((resolve, reject) => {
              canvas.toBlob((blob) => {
                if (blob) {
                  const file = new File(
                    [blob],
                    `page${pageNum}_${Date.now()}.png`,
                    {
                      type: "image/png",
                    }
                  );
                  resolve(file);
                } else {
                  reject(new Error("Canvas toBlob failed"));
                }
              }, "image/png");
            });
          };

          // Function to combine two pages side by side
          const combinePages = async (page1Num, page2Num) => {
            const [file1, file2] = await Promise.all([
              renderPage(page1Num),
              renderPage(page2Num),
            ]);

            return new Promise((resolve, reject) => {
              const img1 = new Image();
              const img2 = new Image();

              let loadedImages = 0;

              const checkLoaded = () => {
                if (++loadedImages === 2) {
                  const canvas = document.createElement("canvas");
                  const context = canvas.getContext("2d");

                  canvas.width = img1.width + img2.width;
                  canvas.height = Math.max(img1.height, img2.height);

                  // Draw both images side by side
                  context.drawImage(img1, 0, 0);
                  context.drawImage(img2, img1.width, 0);

                  canvas.toBlob((blob) => {
                    if (blob) {
                      const file = new File(
                        [blob],
                        `combined_${page1Num}_${page2Num}_${Date.now()}.png`,
                        { type: "image/png" }
                      );
                      resolve(file);
                    } else {
                      reject(new Error("Canvas toBlob failed"));
                    }
                  }, "image/png");
                }
              };

              img1.onload = checkLoaded;
              img2.onload = checkLoaded;

              img1.onerror = img2.onerror = (e) =>
                reject(new Error("Image loading failed"));

              img1.src = URL.createObjectURL(file1);
              img2.src = URL.createObjectURL(file2);
            });
          };

          // Collect pages to render
          const pagesToRender = [];

          // Render the first page as a single image
          pagesToRender.push(renderPage(1));

          // Pair the rest of the pages starting from the second page
          for (let i = 2; i <= numPages; i += 2) {
            if (i + 1 <= numPages) {
              // Combine two pages
              pagesToRender.push(combinePages(i, i + 1));
            } else {
              // Render the last unpaired page
              pagesToRender.push(renderPage(i));
            }
          }

          // Wait for all pages to render
          capturedPdfImages = await Promise.all(pagesToRender);
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      }
      await dispatch(createEdition(chunkPdfFiles, capturedPdfImages, data));
    }
  };
  async function extractPagesFromFile(pdfFile, startPage, endPage) {
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfBufferNode = Buffer.from(pdfBuffer);

    const pdfDoc = await PDFDocument.load(pdfBufferNode);
    const totalPages = pdfDoc.getPageCount();

    if (startPage < 1) {
      console.warn(
        `Requested start page (${startPage}) is less than 1. Adjusting to start at page 1.`
      );
      startPage = 1;
    }

    if (endPage > totalPages) {
      console.warn(
        `Requested end page (${endPage}) exceeds total pages (${totalPages}). Adjusting to end at page ${totalPages}.`
      );
      endPage = totalPages;
    }

    if (startPage > endPage) {
      throw new Error(
        `Invalid range: start page (${startPage}) cannot be greater than end page (${endPage}).`
      );
    }

    const newPdfDoc = await PDFDocument.create();

    for (let i = startPage; i <= endPage; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i - 1]);
      newPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await newPdfDoc.save();
    return pdfBytes;
  }
  // async function extractPagesFromFile(pdfFile, startPage, endPage) {
  //   const pdfBuffer = await pdfFile.arrayBuffer();
  //   const pdfDoc = await PDFDocument.load(pdfBuffer);
  //   const newPdfDoc = await PDFDocument.create();

  //   for (let i = startPage - 1; i < endPage; i++) {
  //     const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
  //     newPdfDoc.addPage(copiedPage);
  //   }

  //   const newPdfBytes = await newPdfDoc.save();
  //   return newPdfBytes;
  // }

  async function dividePdfFileIntoChunks(pdfFile, chunkSize = 10) {
    let pdfBuffer;

    // Ensure the input is a File or Blob
    if (pdfFile instanceof Blob || pdfFile instanceof File) {
      pdfBuffer = await pdfFile.arrayBuffer(); // Convert to ArrayBuffer
    } else {
      throw new Error("Invalid input: pdfFile must be a File or Blob.");
    }

    // Convert ArrayBuffer to Buffer (Node.js environment)
    const pdfBufferNode = Buffer.from(pdfBuffer);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBufferNode);
    const totalPages = pdfDoc.getPageCount();

    // Divide into chunks
    const files = [];
    for (let i = 0; i < totalPages; i += chunkSize) {
      const startPage = i + 1;
      const endPage = Math.min(i + chunkSize, totalPages);

      // Extract pages for each chunk
      const chunk = await extractPagesFromFile(pdfFile, startPage, endPage);

      // Push the chunk details
      files.push({ chunk, startPage, endPage });
    }

    return files;
  }

  useEffect(() => {
    if (authState) dispatch(fetchUser(authState.id));
  }, [authState]);
  useEffect(() => {
    let newSubgenres = [];

    genre.forEach((selectedGenre) => {
      const genreObj = userGenres.find((g) => g.genre === selectedGenre);

      if (genreObj) {
        newSubgenres = [...newSubgenres, ...genreObj.subGenres];
      }
    });

    newSubgenres = [...new Set(newSubgenres)];
    setSubGenre(newSubgenres);
  }, [genre]);

  return (
    <Box p={2}>
      {/* <PdfToImageConverter/> */}
      <Flex mt={4} justifyContent="space-between" alignItems="center" w="65%">
        <Flex alignItems="center">
          <Text fontSize="lg" mt={4} mb={4}>
            Create Edition
          </Text>
        </Flex>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered
         closeOnOverlayClick={false} // Disable closing on overlay click
         closeOnEsc={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader size="md" mt="4">
              Creating Edition
            </ModalHeader>
            <ModalBody>
              <Box mt="4">
                <Text mt="4" fontSize="md" fontWeight="bold">
                  {currentText}
                </Text>
                <Progress
                  mt="4"
                  value={uploadProgress}
                  size="sm"
                  colorScheme="blue"
                  mb={4}
                  isIndeterminate={uploadProgress === 0}
                />
                  <Text mt="4" fontSize="sm" fontWeight="bold">
                  Please do not close or reload the page.
                </Text>
              </Box>
            </ModalBody>
            <ModalFooter>
              {/* <Button onClick={onClose}>Close</Button> */}
            </ModalFooter>
          </ModalContent>
        </Modal>
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
              type="file"
              display="none"
              id="file-upload"
              accept="application/pdf"
              onChange={handlePdfSelect}
            />
            <label htmlFor="file-upload">
              <Button as="span">Choose New File</Button>
            </label>
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
                maxLength={700}
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
              <Input value={channelName} isDisabled size="sm" />
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
                  rows="4"
                />
              </FormControl>
            </Box>
          </Box>

          <Box overflow="hidden" mt="8">
            <Box
              borderTopWidth="2px"
              borderBottomWidth="2px"
              borderColor="gray.300"
            >
              <Text
                fontSize="mdl"
                textTransform="uppercase"
                fontWeight="bold"
                mt={3}
                mb={3}
              >
                Demographics reference
              </Text>
            </Box>

            <Box mt="4">
              <DemographicForm />
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
                maxLength={80}
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
          <Button
            mt="8"
            w="full"
            fontSize="md"
            colorScheme="red"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default CreateEdition;
