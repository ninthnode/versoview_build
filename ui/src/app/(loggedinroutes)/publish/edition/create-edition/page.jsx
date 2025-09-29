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
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/publish/PdfViewer"), {
  ssr: false,
});
import { useDispatch, useSelector } from "react-redux";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { fetchUser } from "@/redux/profile/actions";
import { RefreshUserToken } from "@/redux/auth/authActions";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import genres from "@/static-data/genres";
import DemographicForm from "./DemographicForm";

import axios from "axios";
const CreateEdition = () => {
  const UploadLimit = 500;
  const [pdfImage, setPdfImage] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
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

  const [isExceededLimit, setIsExceededLimit] = useState(false);
  const [totalPreviousPdfSize, setTotalPreviousPdfSize] = useState(0);

  // SSE-related state
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [step, setStep] = useState(0);
  const eventSourceRef = useRef(null);


// SSE Connection Effect
useEffect(() => {
  if (!sessionId) return;

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/progress/${sessionId}`
    );
    
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
      setCurrentText('Connection established. Processing PDF...');
      setProgress(20);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE Progress Update:', data);

        switch (data.type) {
          case 'connected':
            setCurrentText('Connected! Processing your PDF...');
            if (data.progress) setProgress(data.progress);
            break;

          case 'heartbeat':
            // Keep connection alive, no UI update needed
            console.log('SSE heartbeat received');
            break;

          case 'error':
            console.error('SSE Error:', data);
            setCurrentText(data.message || 'An error occurred');
            toast({
              title: "Error",
              description: data.message || "An error occurred during processing",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            onClose();
            break;

          case 'completed':
            setProgress(100);
            setCurrentText(data.message || 'Processing completed!');
            toast({
              title: "Success",
              description: "Edition created successfully!",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            onClose();
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            }
            break;

          default:
            if (data.progress !== undefined) {
              setProgress(data.progress);
            }
            if (data.message) {
              setCurrentText(data.message);
            }
            if (data.step) {
              setStep(data.step);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);

      // Enhanced error handling for production
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed, attempting to reconnect...');
        setTimeout(() => {
          console.log('Reconnecting SSE...');
          connectSSE();
        }, 3000);
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('SSE connection is reconnecting...');
        setCurrentText('Connection interrupted, reconnecting...');
      }
    };
  };

  connectSSE();

  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };
}, [sessionId]);

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
      setPdfFile(file); // Store the actual file for SSE
      setPdfImage(URL.createObjectURL(file)); // Keep for preview
      
      // Check file size
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      if (Number(fileSizeInMB) + totalPreviousPdfSize >= UploadLimit) {
        setIsExceededLimit(true);
        setPdfFile(null);
        setPdfImage("");
        toast({
          title: "File Too Large",
          description: `File exceeds the ${UploadLimit}MB limit.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setIsExceededLimit(false);
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  const refreshTokenIfNeeded = async () => {
    try {
      // Check if current token is still valid (not expired)
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        try {
          // Decode JWT to check expiration (basic check)
          const tokenPayload = JSON.parse(atob(currentToken.replace(/"/g, '').split('.')[1]));
          const currentTime = Date.now() / 1000;

          // If token expires in more than 5 minutes, no need to refresh
          if (tokenPayload.exp && (tokenPayload.exp - currentTime) > 300) {
            console.log('Token still valid, skipping refresh');
            return true;
          }
        } catch (e) {
          console.log('Token decode failed, will refresh');
        }
      }

      let refreshToken = localStorage.getItem('refreshToken');
      refreshToken = refreshToken ? refreshToken.replace(/^"(.*)"$/, "$1") : null;

      if (refreshToken) {
        console.log('Refreshing token before upload...');
        await dispatch(RefreshUserToken(refreshToken));
        return true;
      }
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in again to upload files.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleSaveSSE = async () => {
    // Validation for SSE approach
    if (!pdfFile || !about || !date || !genre.length) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mandatory * fields and upload a PDF.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (isExceededLimit) {
      toast({
        title: "File Size Exceeded",
        description: `Your file exceeds the ${UploadLimit}MB limit.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      onOpen();
      setProgress(0);
      setCurrentText("Preparing upload...");

      // Refresh token before upload to prevent expiration during processing
      const tokenRefreshed = await refreshTokenIfNeeded();
      if (!tokenRefreshed) {
        onClose();
        return;
      }

      setCurrentText("Uploading file...");
      setProgress(5); // Show some progress immediately

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('about', about);
      formData.append('edition', edition);
      formData.append('date', date);
      formData.append('genre', JSON.stringify(genre));
      formData.append('subGenre', JSON.stringify(subGenre));

      // Send request to SSE endpoint with fresh token
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/create-edition-sse`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
          },
        }
      );

      if (response.data.success) {
        // Start SSE connection with received session ID
        setCurrentText("File uploaded. Connecting for progress updates...");
        setProgress(15);
        setSessionId(response.data.sessionId);
      } else {
        throw new Error(response.data.message || 'Failed to start processing');
      }

    } catch (error) {
      console.error("Error starting edition creation:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start processing",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    }
  };

  const handleSave = async () => {
    return handleSaveSSE();
  };

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
      <Text fontSize="lg" mt={4} mb={4}>
        Create Edition
      </Text>
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
                <Text fontSize="sm" color="gray.500" mt="1">
                  Step {step}/3 • Connection: {isConnected ? 'Connected' : 'Connecting...'}
                </Text>
                <Progress
                  mt="4"
                  value={progress}
                  size="sm"
                  colorScheme="blue"
                  mb={4}
                  isIndeterminate={progress === 0}
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
              You have exceeded the maximum free account size of {UploadLimit}MB. Please Upgrade your plan.
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
