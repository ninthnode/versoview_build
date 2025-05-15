import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLibraryImagesByEditionId } from '../../redux/publish/publishActions';
import Image from 'next/image';

const LibraryImages = ({ editionId }) => {
  const dispatch = useDispatch();
  const { libraryImages, libraryImagesLoading, error, fullLibraryImages } = useSelector((state) => state.publish);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (editionId) {
      dispatch(getLibraryImagesByEditionId(editionId));
    }
  }, [dispatch, editionId]);

  const handleImageClick = (imageData) => {
    setSelectedImage(imageData);
  };

  const handleCloseDetails = () => {
    setSelectedImage(null);
  };

  if (libraryImagesLoading) {
    return <div className="flex justify-center items-center h-40">Loading library images...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading library images: {error}</div>;
  }

  if (!libraryImages || libraryImages.length === 0) {
    return <div className="text-gray-500">No library images available</div>;
  }

  // Check if we have the full data
  const hasFullData = fullLibraryImages && fullLibraryImages.length > 0;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Library Images ({libraryImages.length})</h3>
      
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hasFullData 
          ? fullLibraryImages.map((imageData, index) => (
              <div 
                key={imageData._id}
                className="relative h-48 border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(imageData)}
              >
                <Image
                  src={imageData.imageUrl}
                  alt={imageData.title || `Library image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                {imageData.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-sm truncate">
                    {imageData.title}
                  </div>
                )}
              </div>
            ))
          : libraryImages.map((imageUrl, index) => (
              <div 
                key={index}
                className="relative h-48 border rounded-md overflow-hidden"
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

      {/* Image Details Modal */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedImage.title || "Image Details"}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative w-full h-64 md:h-96 mb-4">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title || "Library image"}
                fill
                className="object-contain"
              />
            </div>
            
            {selectedImage.description && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            )}
            
            {selectedImage.tags && selectedImage.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              Added {new Date(selectedImage.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryImages; 