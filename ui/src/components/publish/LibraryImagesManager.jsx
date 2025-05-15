import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLibraryImagesByEditionId } from '../../redux/publish/publishActions';
import LibraryImages from './LibraryImages';
import LibraryImageUploader from './LibraryImageUploader';

const LibraryImagesManager = ({ editionId }) => {
  const dispatch = useDispatch();
  const { singleEdition } = useSelector((state) => state.publish);

  useEffect(() => {
    if (editionId) {
      // Refresh library images when component mounts
      dispatch(getLibraryImagesByEditionId(editionId));
    }
  }, [dispatch, editionId]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Edition Library Images</h2>
      
      {/* Display existing library images */}
      <LibraryImages editionId={editionId} />
      
      {/* Uploader component */}
      <LibraryImageUploader editionId={editionId} />
    </div>
  );
};

export default LibraryImagesManager; 