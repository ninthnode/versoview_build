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
  const [mergingProgress, setMergingProgress] = useState({ current: 0, total: 0 });

useEffect(() => {
  if (uploadProgress >= 0) {
    console.log(uploadProgress);
    setProgress(uploadProgress);

    if (uploadProgress === 0) {
      setCurrentText("Please be patient this might take some time...");
    } else if (uploadProgress <= 50 && uploadProgress > 0) {
      setCurrentText("Step 1: Uploading PDF");
    } else if (uploadProgress <= 75 && uploadProgress > 50) {
      setCurrentText("Step 2: Uploading Images");
    } else if (uploadProgress <= 100 && uploadProgress > 75) {
      setCurrentText("Step 3: Uploading Merged Images");
    }
  }
}, [uploadProgress]);
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

          setTotalPreviousPdfSize(Number(response?.data?.data) || 0);
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
  const loadImage = (source) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const timeout = setTimeout(() => {
        reject(new Error(`Image loading timeout: ${source.name || source}`));
      }, 8000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Image loading error:', error, 'Source:', source);
        reject(new Error(`Failed to load image: ${source.name || source}`));
      };

      try {
        let imageUrl;

        if (source instanceof File) {
          imageUrl = URL.createObjectURL(source);
        } else {
          imageUrl = new URL(source, window.location.origin).href;

          const currentOrigin = new URL(window.location.origin);
          if (new URL(imageUrl).origin !== currentOrigin.origin) {
            img.crossOrigin = "anonymous";
          }
        }

        img.src = imageUrl;

      } catch (e) {
        console.warn('Source parsing failed, assuming same origin string URL:', source);
        img.src = source;
      }
    });
  };
const loadImageWithFetch = async (source) => {
  // If it's a File, directly pass it to loadImage
  if (source instanceof File) {
    return await loadImage(source);
  }

  try {
    return await loadImage(source);
  } catch (error) {
    console.warn('Normal image loading failed, trying fetch approach:', error);

    try {
      const response = await fetch(source, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load image from blob: ${source}`));
        };
        img.src = objectUrl;
      });

    } catch (fetchError) {
      throw new Error(`All loading methods failed for: ${source} - ${fetchError.message}`);
    }
  }
};


const mergeImagesInBatches = async (imageUrls) => {
  if (imageUrls.length === 0) return [];

  const combinedImages = [];
  setMergingProgress({ current: 0, total: Math.ceil(imageUrls.length / 2) });

  try {
    // Keep the first image as standalone
    combinedImages.push(imageUrls[0]);

    const canvasToFilePromise = (canvas, filename = `merged_${Date.now()}.jpg`, quality = 0.75) => {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const mergedFile = new File([blob], filename, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(mergedFile);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, "image/jpeg", quality);
      });
    };
    const combineTwoImages = async (url1, url2) => {
      try {
        const [img1, img2] = await Promise.all([
          loadImageWithFetch(url1),
          loadImageWithFetch(url2),
        ]);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = img1.width + img2.width;
        canvas.height = Math.max(img1.height, img2.height);

        context.drawImage(img1, 0, 0);
        context.drawImage(img2, img1.width, 0);

        const mergedUrl = await canvasToFilePromise(canvas);
        return mergedUrl;

      } catch (error) {
        console.error("Error combining images:", error);
        throw error;
      }
    };

    for (let i = 1; i < imageUrls.length; i += 4) {
      const batchEnd = Math.min(i + 4, imageUrls.length);
      const batchPromises = [];

      for (let j = i; j < batchEnd; j += 2) {
        if (j + 1 < imageUrls.length) {
          batchPromises.push(
            combineTwoImages(imageUrls[j], imageUrls[j + 1])
              .catch(() => [imageUrls[j], imageUrls[j + 1]]) // Fallback to individual images
          );
        } else {
          batchPromises.push(Promise.resolve(imageUrls[j]));
        }
      }

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (Array.isArray(result.value)) {
            combinedImages.push(...result.value);
          } else {
            combinedImages.push(result.value);
          }
        }
      });

      // Update progress
      setMergingProgress((prev) => ({
        ...prev,
        current: Math.floor((i + 4 - 1) / 2),
      }));

      // Optional small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return combinedImages;

  } catch (error) {
    console.error("Error in mergeImagesInBatches:", error);
    return imageUrls;
  }
};

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

      console.log(Number(totalSizeInMB), totalPreviousPdfSize);
      if (Number(totalSizeInMB) + totalPreviousPdfSize >= UploadLimit) {
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

          async function compressImage(file, maxSizeMB = 1) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                  let width = img.width;
                  let height = img.height;
                  let quality = 0.9;
                  const maxSize = maxSizeMB * 1024 * 1024;

                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");

                  canvas.width = width;
                  canvas.height = height;

                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);

                  // Recursive compression
                  const compressLoop = () => {
                    canvas.toBlob(
                      (blob) => {
                        if (blob.size <= maxSize || quality <= 0.5) {
                          const newFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                          });
                          resolve(newFile);
                        } else {
                          quality -= 0.1;
                          compressLoop();
                        }
                      },
                      "image/jpeg",
                      quality
                    );
                  };

                  compressLoop();
                };
                img.onerror = reject;
              };
              reader.onerror = reject;
            });
          }

          // Function to render a single page as an image
          const renderPage = async (pageNum, scale = 3.0) => {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            return new Promise((resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) return reject(new Error("Canvas toBlob failed"));

                  const file = new File(
                    [blob],
                    `page${pageNum}_${Date.now()}.jpg`,
                    {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    }
                  );

                  if (file.size > 1024 * 1024) {
                    compressImage(file, 1)
                      .then((compressedFile) => resolve(compressedFile))
                      .catch(() => resolve(file));
                  } else {
                    resolve(file);
                  }
                },
                "image/jpeg",
                0.85
              );
            });
          };

          // Collect pages to render
          const pagesToRender = [];

          // Pair the rest of the pages starting from the second page
          for (let i = 1; i <= numPages; i++) {
            pagesToRender.push(renderPage(i));
          }

          // Wait for all pages to render
          capturedPdfImages = await Promise.all(pagesToRender);
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      }


       // Step 3: Uploading Merged Images
      let mergedImages = await mergeImagesInBatches(capturedPdfImages)
      console.log(capturedPdfImages);
      console.log(mergedImages);
      await dispatch(
        createEdition(chunkPdfFiles, capturedPdfImages,mergedImages, data, totalSizeInMB)
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

          {/* <Box overflow="hidden" mt="8">
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
          </Box> */}
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
              You have exceeded the maximum file size of {UploadLimit}MB. Please
              Upgrade your plan, or delete existing editions.
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
