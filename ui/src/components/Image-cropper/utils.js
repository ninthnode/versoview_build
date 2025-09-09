
// image.setAttribute('crossOrigin', 'anonymous'); // To avoid CORS issues
export const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });
  
  // Function to compress image while maintaining quality
  export const compressImage = async (imageSrc, maxSizeInMB = 5, quality = 0.9) => {
    return new Promise(async (resolve) => {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate the size needed to stay under maxSizeInMB
      const targetSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      // Start with original dimensions
      let { width, height } = image;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(image, 0, 0, width, height);
      
      // Convert to blob to check size
      canvas.toBlob(async (blob) => {
        if (blob.size <= targetSizeInBytes) {
          // Image is already under the size limit
          resolve(URL.createObjectURL(blob));
          return;
        }
        
        // Need to compress - reduce dimensions while maintaining aspect ratio
        const aspectRatio = width / height;
        const scaleFactor = Math.sqrt(targetSizeInBytes / blob.size);
        
        width = Math.floor(width * scaleFactor);
        height = Math.floor(height * scaleFactor);
        
        // Ensure minimum dimensions
        if (width < 800) {
          width = 800;
          height = Math.floor(width / aspectRatio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        
        canvas.toBlob((compressedBlob) => {
          if (compressedBlob) {
            resolve(URL.createObjectURL(compressedBlob));
          } else {
            // Fallback to original if compression fails
            resolve(imageSrc);
          }
        }, 'image/jpeg', quality);
        
      }, 'image/jpeg', quality);
    });
  };

  // Function to get file size from data URL or blob URL
  export const getImageSize = async (imageSrc) => {
    if (imageSrc.startsWith('data:')) {
      // Calculate size from data URL
      const base64 = imageSrc.split(',')[1];
      return (base64.length * 3) / 4; // Approximate size in bytes
    } else if (imageSrc.startsWith('blob:')) {
      // Fetch the blob to get size
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        return blob.size;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  // Function to get the cropped image
  export const getCroppedImg = async (imageSrc, pixelCrop, quality = 0.95) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob((file) => {
        if (file) {
          resolve(URL.createObjectURL(file));
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg', quality);
    });
  };
  
