import React, { useState } from 'react';
import LibraryImageSelector from './publish/LibraryImageSelector';

/**
 * Example component showing how to integrate the LibraryImageSelector
 * with a PostForm component
 */
const PostFormWithLibrary = ({ editionId }) => {
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const openLibraryModal = () => {
    setIsLibraryModalOpen(true);
  };
  
  const closeLibraryModal = () => {
    setIsLibraryModalOpen(false);
  };
  
  const handleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl);
    // Additional handling for the selected image in the post form
  };
  
  return (
    <div>
      {/* Post form fields */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Content
        </label>
        <textarea 
          className="w-full px-3 py-2 border rounded-md" 
          rows="4"
        ></textarea>
      </div>
      
      {/* Selected image preview */}
      {selectedImage && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Image:</p>
          <div className="relative h-48 w-full sm:w-1/2 border rounded-md overflow-hidden">
            <img 
              src={selectedImage} 
              alt="Selected library image" 
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}
      
      {/* Library button */}
      <button 
        type="button"
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

export default PostFormWithLibrary; 