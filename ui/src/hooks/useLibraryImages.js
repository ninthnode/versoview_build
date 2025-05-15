import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLibraryImagesByEditionId } from '../redux/publish/publishActions';
import axios from 'axios';
import { GET_LIBRARY_IMAGES_FAILURE } from '../redux/publish/publishActions';

/**
 * Custom hook to fetch and manage library images for an edition
 * @param {string} editionId - The ID of the edition to fetch library images for
 * @returns {Object} Library images state and handlers
 */
const useLibraryImages = (editionId) => {
  const dispatch = useDispatch();
  const { 
    libraryImages, 
    fullLibraryImages, 
    libraryImagesLoading, 
    error,
    uploadingLibraryImage 
  } = useSelector((state) => state.publish);
  
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [directImages, setDirectImages] = useState([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);

  // Debug logs with more detail
  console.log(`===== useLibraryImages HOOK INITIALIZED =====`);
  console.log(`editionId: ${editionId}`);
  console.log(`refresh counter: ${refreshCounter}`);
  console.log(`Redux libraryImages length: ${libraryImages?.length || 0}`);
  console.log(`Redux libraryImagesLoading: ${libraryImagesLoading}`);
  console.log(`Redux error: ${error}`);

  // Define fetchDirectly first before using it in any other function
  const fetchDirectly = useCallback(async (id) => {
    if (!id) {
      console.log("No editionId provided for fetchDirectly, skipping");
      return;
    }
    
    try {
      console.log(`Making direct API call with editionId: ${id}`);
      setDirectLoading(true);
      setDirectError(null);
      
      const token = localStorage.getItem("token")?.replaceAll('"', "") || '';
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/editions/getLibraryImages/${id}`;
      
      console.log(`Direct API URL: ${apiUrl}`);
      console.log("Making axios GET request...");
      
      const response = await axios.get(apiUrl, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      
      console.log(`Direct API response status: ${response.status}`);
      console.log(`Images count in response: ${(response.data.data || []).length}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setDirectImages(response.data.data);
      } else {
        console.warn("API returned unexpected data format:", response.data);
        setDirectImages([]);
      }
    } catch (err) {
      console.error(`Direct API error: ${err.message}`);
      console.error(`Error details:`, err.response?.data || err);
      setDirectError(err.message);
    } finally {
      setDirectLoading(false);
      console.log("Direct API call completed");
    }
  }, []);

  // Function to refresh the library images
  const refreshLibraryImages = useCallback(() => {
    console.log(`===== REFRESHING LIBRARY IMAGES =====`);
    console.log(`Edition ID: ${editionId}`);
    
    if (!editionId) {
      console.error("Cannot refresh library images without an editionId");
      return;
    }
    
    // First dispatch the Redux action to update the global state
    dispatch(getLibraryImagesByEditionId(editionId));
    console.log("Dispatched Redux action to refresh library images");
    
    // Then also make a direct API call for immediate update
    setTimeout(() => {
      console.log("Making direct API call for immediate update");
      fetchDirectly(editionId);
    }, 100);
    
    // Increment refresh counter (mostly for components that don't use Redux)
    setRefreshCounter(prev => prev + 1);
  }, [editionId, dispatch, fetchDirectly]);

  // Direct API call for testing
  useEffect(() => {
    console.log(`===== useLibraryImages DIRECT API EFFECT =====`);
    
    // Only make a direct API call if:
    // 1. We have an editionId
    // 2. We don't have library images from Redux
    // 3. The Redux library images aren't currently loading
    if (editionId && (!libraryImages || libraryImages.length === 0) && !libraryImagesLoading) {
      console.log(`No library images in Redux state, making direct API call for edition ${editionId}`);
      fetchDirectly(editionId);
    } else if (libraryImages && libraryImages.length > 0) {
      console.log(`Using ${libraryImages.length} images from Redux state instead of direct API call`);
      setDirectImages([]); // Clear direct images to prefer Redux state
    }
  }, [editionId, libraryImages, libraryImagesLoading, refreshCounter, fetchDirectly]);

  // Fetch library images when editionId changes or refresh is triggered
  useEffect(() => {
    console.log(`===== useLibraryImages REDUX EFFECT =====`);
    
    if (editionId) {
      console.log(`Dispatching getLibraryImagesByEditionId with editionId: ${editionId}`);
      dispatch(getLibraryImagesByEditionId(editionId));
    } else {
      console.log("No editionId provided, skipping Redux API call");
    }
  }, [dispatch, editionId, refreshCounter]);

  // Function to add a new image to the top of the list
  const addImageToLibrary = (imageUrl) => {
    if (!imageUrl) return;
    
    console.log(`Adding new image to library: ${imageUrl}`);
    
    setDirectImages(prev => {
      // Add to the beginning of the array to show at the top
      const newImages = [imageUrl, ...prev];
      console.log(`Updated direct images list with ${newImages.length} images`);
      return newImages;
    });
  };

  // Debug log current state
  useEffect(() => {
    console.log(`===== useLibraryImages STATE UPDATE =====`);
    console.log(`Redux libraryImages: ${libraryImages?.length || 0} images`);
    console.log(`Redux fullLibraryImages: ${fullLibraryImages?.length || 0} full images`);
    console.log(`Redux loading: ${libraryImagesLoading}`);
    console.log(`Redux error: ${error}`);
    console.log(`Direct images: ${directImages.length} images`);
    console.log(`Direct loading: ${directLoading}`);
    console.log(`Direct error: ${directError}`);
  }, [libraryImages, fullLibraryImages, libraryImagesLoading, error, directImages, directLoading, directError]);

  // Choose the best available images source
  const finalImages = useMemo(() => {
    // Always prioritize Redux state if it has data
    if (libraryImages && libraryImages.length > 0) {
      console.log(`Using ${libraryImages.length} library images from Redux state`);
      return libraryImages;
    } 
    
    // Fall back to direct API results if Redux has no data
    if (directImages && directImages.length > 0) {
      console.log(`Falling back to ${directImages.length} direct API images`);
      return directImages;
    }
    
    console.log(`No images available from either source`);
    return [];
  }, [libraryImages, directImages]);
  
  console.log(`Final images being returned: ${finalImages.length}`);

  // Add a timeout protection for loading state
  useEffect(() => {
    // If loading state gets stuck, reset it after timeout
    let loadingTimeout = null;
    
    if (libraryImagesLoading) {
      console.log("useLibraryImages: Loading state active, setting safety timeout");
      
      // Set a timeout to force reset loading state after 15 seconds
      loadingTimeout = setTimeout(() => {
        console.log("useLibraryImages: Loading state timeout triggered - forcing reset");
        setDirectLoading(false);
        dispatch({ 
          type: GET_LIBRARY_IMAGES_FAILURE, 
          payload: "Loading timeout - please try again" 
        });
      }, 15000);
    }
    
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [libraryImagesLoading, dispatch]);

  return {
    libraryImages: finalImages,
    fullLibraryImages,
    isLoading: libraryImagesLoading || directLoading || uploadingLibraryImage,
    error: error || directError,
    refreshLibraryImages,
    addImageToLibrary
  };
};

export default useLibraryImages; 