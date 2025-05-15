import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadNewLibraryImage } from '../../redux/publish/publishActions';
import Image from 'next/image';

const LibraryImageUploader = ({ editionId, onUploadSuccess }) => {
  const dispatch = useDispatch();
  const { libraryImageProgress, uploadingLibraryImage } = useSelector((state) => state.publish);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartUpload = () => {
    setShowMetadataForm(true);
  };

  const handleCancelMetadata = () => {
    setShowMetadataForm(false);
  };

  const handleCompleteUpload = async () => {
    if (!selectedImage || !editionId) return;

    const key = `library-images/${Date.now()}-${selectedImage.name}`;
    const contentType = selectedImage.type;

    // Process tags from comma-separated string to array
    const processedTags = metadata.tags
      ? metadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    try {
      await dispatch(uploadNewLibraryImage(
        key, 
        contentType, 
        selectedImage, 
        editionId, 
        {
          title: metadata.title,
          description: metadata.description,
          tags: processedTags
        }
      ));
      
      // Clear selection and metadata after successful upload
      setSelectedImage(null);
      setPreviewUrl(null);
      setShowMetadataForm(false);
      setMetadata({
        title: '',
        description: '',
        tags: ''
      });

      // Call the success callback if provided
      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setShowMetadataForm(false);
    setMetadata({
      title: '',
      description: '',
      tags: ''
    });
  };

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Upload Library Image</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={showMetadataForm || uploadingLibraryImage}
        />
      </div>

      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="relative h-48 w-full sm:w-1/2 md:w-1/3 border rounded-md overflow-hidden">
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {showMetadataForm && (
        <div className="mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter a title for this image"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border rounded-md"
              rows="3"
              placeholder="Enter a description for this image"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional)
            </label>
            <input
              type="text"
              name="tags"
              value={metadata.tags}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter tags separated by commas (e.g. nature, landscape, art)"
            />
          </div>
        </div>
      )}

      {libraryImageProgress > 0 && libraryImageProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${libraryImageProgress}%` }}
          ></div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(libraryImageProgress)}% uploaded</p>
        </div>
      )}

      <div className="flex space-x-3">
        {!showMetadataForm ? (
          <>
            <button
              onClick={handleStartUpload}
              disabled={!selectedImage || uploadingLibraryImage || libraryImageProgress > 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                !selectedImage || uploadingLibraryImage || libraryImageProgress > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Continue
            </button>
            {selectedImage && (
              <button
                onClick={handleCancel}
                disabled={uploadingLibraryImage || libraryImageProgress > 0}
                className={`px-4 py-2 rounded-md text-gray-700 font-medium ${
                  uploadingLibraryImage || libraryImageProgress > 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleCompleteUpload}
              disabled={uploadingLibraryImage || libraryImageProgress > 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                uploadingLibraryImage || libraryImageProgress > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {uploadingLibraryImage ? 'Uploading...' : 'Upload Image'}
            </button>
            <button
              onClick={handleCancelMetadata}
              disabled={uploadingLibraryImage || libraryImageProgress > 0}
              className={`px-4 py-2 rounded-md text-gray-700 font-medium ${
                uploadingLibraryImage || libraryImageProgress > 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryImageUploader; 