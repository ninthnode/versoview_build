import React, { useState } from 'react';
import LibraryImageSelector from './publish/LibraryImageSelector';

/**
 * Test component showing the sharing of library between two components
 */
const LibraryImageSharingTest = ({ editionId }) => {
  // Image Cropper State
  const [isCropperLibraryOpen, setCropperLibraryOpen] = useState(false);
  const [cropperSelectedImage, setCropperSelectedImage] = useState(null);
  
  // Post Form State
  const [isPostLibraryOpen, setPostLibraryOpen] = useState(false);
  const [postSelectedImage, setPostSelectedImage] = useState(null);
  
  if (!editionId) {
    return <div className="text-red-500">Edition ID is required</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Library Image Sharing Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ImageCropper Mock */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Image Cropper</h2>
          
          {cropperSelectedImage && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Image:</p>
              <div className="relative h-48 border rounded-md overflow-hidden">
                <img 
                  src={cropperSelectedImage} 
                  alt="Selected cropper image" 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setCropperLibraryOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Open Library from Cropper
          </button>
          
          <LibraryImageSelector
            editionId={editionId}
            isOpen={isCropperLibraryOpen}
            onClose={() => setCropperLibraryOpen(false)}
            onSelect={(url) => setCropperSelectedImage(url)}
            showUploader={true}
          />
        </div>
        
        {/* PostForm Mock */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Post Form</h2>
          
          {postSelectedImage && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Image:</p>
              <div className="relative h-48 border rounded-md overflow-hidden">
                <img 
                  src={postSelectedImage} 
                  alt="Selected post image" 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setPostLibraryOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Open Library from Post Form
          </button>
          
          <LibraryImageSelector
            editionId={editionId}
            isOpen={isPostLibraryOpen}
            onClose={() => setPostLibraryOpen(false)}
            onSelect={(url) => setPostSelectedImage(url)}
            showUploader={true}
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">How this works:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Both components use the same LibraryImageSelector component.</li>
          <li>The selector uses a Redux store to manage the library images.</li>
          <li>When you upload a new image in one component, it's available in both.</li>
          <li>The useLibraryImages hook ensures data consistency.</li>
        </ol>
      </div>
    </div>
  );
};

export default LibraryImageSharingTest; 