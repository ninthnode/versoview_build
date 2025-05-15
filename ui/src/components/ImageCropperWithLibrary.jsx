import React, { useState } from 'react';
import LibraryImageSelector from './publish/LibraryImageSelector';

/**
 * Example component showing how to integrate the LibraryImageSelector
 * with an ImageCropper component
 */
const ImageCropperWithLibrary = ({ editionId, onImageSelect }) => {
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  
  const openLibraryModal = () => {
    setIsLibraryModalOpen(true);
  };
  
  const closeLibraryModal = () => {
    setIsLibraryModalOpen(false);
  };
  
  const handleImageSelect = (imageUrl) => {
    // Handle the selected image
    if (onImageSelect && typeof onImageSelect === 'function') {
      onImageSelect(imageUrl);
    }
  };
  
  return (
    <div>
      {/* Your existing image cropper component */}
      
      {/* Library button */}
      <button 
        onClick={openLibraryModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Choose from Library
      </button>
      
      {/* Library image selector modal */}
      <LibraryImageSelector
        editionId={editionId}
        isOpen={isLibraryModalOpen}
        onClose={closeLibraryModal}
        onSelect={handleImageSelect}
        showUploader={true}
      />
    </div>
  );
};

export default ImageCropperWithLibrary; 