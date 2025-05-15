import React, { useState } from 'react';
import Image from 'next/image';
import useLibraryImages from '../../hooks/useLibraryImages';
import LibraryImageUploader from './LibraryImageUploader';

/**
 * A modal component for selecting library images
 * @param {Object} props - Component props
 * @param {string} props.editionId - Edition ID to fetch images for
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {function} props.onSelect - Function to call when an image is selected
 * @param {boolean} props.showUploader - Whether to show the image uploader
 */
const LibraryImageSelector = ({ 
  editionId, 
  isOpen, 
  onClose, 
  onSelect,
  showUploader = true
}) => {
  const { libraryImages, fullLibraryImages, isLoading, error, refreshLibraryImages } = useLibraryImages(editionId);
  const [searchTerm, setSearchTerm] = useState('');
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Handle image selection
  const handleSelectImage = (imageUrl) => {
    onSelect(imageUrl);
    onClose();
  };
  
  // Filter images based on search term
  const filteredImages = searchTerm && fullLibraryImages 
    ? fullLibraryImages.filter(img => 
        (img.title && img.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : fullLibraryImages || [];
  
  // Extract URLs for backwards compatibility
  const imageUrls = searchTerm && fullLibraryImages 
    ? filteredImages.map(img => img.imageUrl)
    : libraryImages || [];

  // Handle successful upload
  const handleUploadSuccess = () => {
    refreshLibraryImages();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Library Images</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="px-6 py-3 border-b">
          <input
            type="text"
            placeholder="Search by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        
        {/* Images Grid */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading library images...</p>
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : imageUrls.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              {searchTerm ? 'No images match your search.' : 'No library images available.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fullLibraryImages && fullLibraryImages.length > 0
                ? filteredImages.map((image) => (
                    <div
                      key={image._id}
                      className="relative h-48 border rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleSelectImage(image.imageUrl)}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={image.title || "Library image"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {image.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-sm truncate">
                          {image.title}
                        </div>
                      )}
                    </div>
                  ))
                : imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative h-48 border rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleSelectImage(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Library image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))
              }
            </div>
          )}
        </div>
        
        {/* Uploader (Optional) */}
        {showUploader && (
          <div className="px-6 py-4 border-t">
            <LibraryImageUploader 
              editionId={editionId} 
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryImageSelector; 