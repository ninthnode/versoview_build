/**
 * Utility functions for handling files and images
 */

/**
 * Converts a Blob URL to a File object
 * @param {string} blobUrl - The URL of the blob
 * @param {string} fileName - The name to give the file
 * @returns {Promise<File>} - A File object created from the blob
 */
export const blobToFile = async (blobUrl, fileName) => {
  console.log(`blobToFile: Converting ${blobUrl} to File with name ${fileName}`);
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });

    console.log(`blobToFile: Successfully converted to File, type: ${file.type}, size: ${file.size}`);
    return file;
  } catch (error) {
    console.error("blobToFile error:", error);
    throw error;
  }
};

/**
 * Reads a file and returns its contents as a data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} - A data URL containing the file data
 */
export const readFile = (file) => {
  console.log(`readFile: Reading file ${file.name}, size: ${file.size}, type: ${file.type}`);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      console.log("readFile: File read complete");
      resolve(reader.result);
    }, false);
    reader.addEventListener("error", (error) => {
      console.error("readFile error:", error);
      reject(error);
    });
    reader.readAsDataURL(file);
  });
};

/**
 * Processes an image to fit within target dimensions while maintaining aspect ratio
 * @param {string} imageDataUrl - The data URL of the image
 * @param {number} targetWidth - The target width (default: 1440)
 * @param {number} targetHeight - The target height (default: 820)
 * @returns {Promise<string>} - A data URL of the processed image
 */
export const processImage = (imageDataUrl, targetWidth = 1440, targetHeight = 820) => {
  console.log(`processImage: Processing image to ${targetWidth}x${targetHeight}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`processImage: Image loaded, original size: ${img.width}x${img.height}`);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background with white
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate aspect ratio to fit within canvas
      let scale = Math.min(targetWidth / img.width, targetHeight / img.height);
      let newWidth = img.width * scale;
      let newHeight = img.height * scale;

      let xOffset = (targetWidth - newWidth) / 2;
      let yOffset = (targetHeight - newHeight) / 2;

      // Draw image on canvas
      ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);

      // Convert canvas to data URL
      const result = canvas.toDataURL("image/png");
      console.log("processImage: Processing complete");
      resolve(result);
    };
    img.onerror = (error) => {
      console.error("processImage error:", error);
      reject(error);
    };
    img.src = imageDataUrl;
  });
};

/**
 * Converts a Blob URL to a Data URL
 * @param {string} blobUrl - The URL of the blob
 * @returns {Promise<string>} - A data URL containing the blob data
 */
export const blobUrlToDataUrl = async (blobUrl) => {
  console.log(`blobUrlToDataUrl: Converting ${blobUrl} to data URL`);
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("blobUrlToDataUrl: Conversion complete");
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.error("blobUrlToDataUrl error:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("blobUrlToDataUrl fetch error:", error);
    throw error;
  }
}; 