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
import axios from "axios";
const CreateEdition = () => {
  const UploadLimit = 500;
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
    "Please be patient this might take some time..."
  );

  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [isExceededLimit, setIsExceededLimit] = useState(false);
  const [totalPreviousPdfSize, setTotalPreviousPdfSize] = useState(0);

  const uploadSteps = useSelector((state) => state.publish.uploadSteps);
  const uploadProgress = useSelector((state) => state.publish.uploadProgress);

  useEffect(() => {
    if (uploadProgress > 0) {
      setProgress(uploadProgress);
      if (uploadProgress < 50) setCurrentText("Step 1: Uploading PDF");
      if (uploadProgress > 50) setCurrentText("Step 2: Uploading Images");
    }
  }, [uploadProgress, uploadSteps]);
  useEffect(() => {
    const fetchData = async () => {
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
  
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getEditionsSize`,
            {
              headers: {
                authorization: `Bearer ${localStorage
                  .getItem("token")
                  .replaceAll('"', "")}`,
              },
            }
          );
  
          setTotalPreviousPdfSize( Number(response?.data?.data) || 0);
        } catch (error) {
          console.error("Error fetching editions size:", error);
        }
      }
    };
  
    fetchData();
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
      if (!response.ok) throw new Error("Fetch failed");
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
      let totalSize = 0;
      let file = await blobToFile(pdfImage, fileName);
      const chunks = await dividePdfFileIntoChunks(file, 10);

      const chunkPdfFiles = await Promise.all(
        chunks.map(async ({ chunk, startPage, endPage }, index) => {
          const fileName = `${startPage}-to-${endPage}-${Date.now()}.pdf`;
          const blob = new Blob([chunk], { type: "application/pdf" });
          const blobFile = await blobToFile(blob, fileName);

          totalSize += blobFile.size; // Add each chunk size

          return blobFile;
        })
      );
      const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

      console.log( Number(totalSizeInMB) ,totalPreviousPdfSize)
      if (
        Number(totalSizeInMB) + totalPreviousPdfSize >=
        UploadLimit
      ) {
        setIsExceededLimit(true);
        onClose();
        return;
      }
      let data = { about, edition, date, genre, subGenre };
      setUploadedPdf(file);

      // Step 2: Upload Library Images
      let capturedPdfImages = [];

      if (file) {
        try {
          const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          // Add this new function for image compression
          async function compressImage(file, maxSizeMB = 1) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                  // Start with original dimensions
                  let width = img.width;
                  let height = img.height;
                  let quality = 1.0;
                  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
                  
                  // If file is already small enough, just return it
                  if (file.size <= maxSize) {
                    resolve(file);
                    return;
                  }
                  
                  // Create canvas for compression
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  
                  // If large image, reduce dimensions
                  if (width > 2000 || height > 2000) {
                    const scale = Math.min(2000 / width, 2000 / height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  
                  // Draw image to canvas with new dimensions
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Convert to blob and check size
                  canvas.toBlob(
                    (blob) => {
                      if (blob.size <= maxSize) {
                        // Create a new file from the compressed blob
                        const newFile = new File([blob], file.name, {
                          type: 'image/png',
                          lastModified: Date.now()
                        });
                        resolve(newFile);
                      } else {
                        // Further reduce quality if still too large
                        quality = Math.max(0.6, quality - 0.1);
                        canvas.toBlob(
                          (blob) => {
                            const newFile = new File([blob], file.name, {
                              type: 'image/png',
                              lastModified: Date.now()
                            });
                            resolve(newFile);
                          },
                          'image/png',
                          quality
                        );
                      }
                    },
                    'image/png',
                    quality
                  );
                };
                img.onerror = reject;
              };
              reader.onerror = reject;
            });
          }

          // Function to render a single page as an image
          const renderPage = async (pageNum, scale = 2.0) => {
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
                      quality: 0.85
                    }
                  );
                  
                  // Compress image if larger than 1MB
                  if (file.size > 1024 * 1024) {
                    compressImage(file, 1)
                      .then(compressedFile => resolve(compressedFile))
                      .catch(() => resolve(file)); // Fallback to original if compression fails
                  } else {
                    resolve(file);
                  }
                } else {
                  reject(new Error("Canvas toBlob failed"));
                }
              }, "image/png", 0.85);
            });
          };

          // Collect pages to render
          const pagesToRender = [];

          // Pair the rest of the pages starting from the second page
          for (let i = 1; i <= numPages; i ++) {
              pagesToRender.push(renderPage(i));
          }

          // Wait for all pages to render
          capturedPdfImages = await Promise.all(pagesToRender);
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      }
      await dispatch(
        createEdition(chunkPdfFiles, capturedPdfImages, data, totalSizeInMB)
      );
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

  async function dividePdfFileIntoChunks(pdfFile, initialChunkSize = 10) {
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
    
    // Adjust chunk size based on total document size
    // Smaller documents can use larger chunks, larger documents need smaller chunks
    let chunkSize = initialChunkSize;
    const fileSizeMB = pdfFile.size / (1024 * 1024);
    
    if (fileSizeMB > 20) {
      // For larger documents, use smaller chunks
      chunkSize = Math.max(5, Math.floor(initialChunkSize / 2));
    } else if (fileSizeMB < 5) {
      // For smaller documents, use larger chunks or even the entire document
      chunkSize = Math.min(20, totalPages);
    }

    // Create an array of chunk specifications
    const chunkSpecs = [];
    for (let i = 0; i < totalPages; i += chunkSize) {
      const startPage = i + 1;
      const endPage = Math.min(i + chunkSize, totalPages);
      chunkSpecs.push({ startPage, endPage });
    }

    // Process chunks with concurrency limit
    const concurrencyLimit = 3; // Process up to 3 chunks at once
    const files = [];
    
    // Process chunks in batches with controlled concurrency
    for (let i = 0; i < chunkSpecs.length; i += concurrencyLimit) {
      const batch = chunkSpecs.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(async ({ startPage, endPage }) => {
          const chunk = await extractPagesFromFile(pdfFile, startPage, endPage);
          return { chunk, startPage, endPage };
        })
      );
      files.push(...batchResults);
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
        <Modal
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          closeOnOverlayClick={false} // Disable closing on overlay click
          closeOnEsc={false}
        >
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
          {isExceededLimit && (
            <Text color="red" fontSize="md">
              You have exceeded the maximum file size of {UploadLimit}MB. Please Upgrade
              your plan, or delete existing editions.
            </Text>
          )}{" "}
          <Button
            mt="8"
            w="full"
            fontSize="md"
            colorScheme="red"
            onClick={handleSave}
            isDisabled={isExceededLimit}
          >
            Save
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default CreateEdition;
