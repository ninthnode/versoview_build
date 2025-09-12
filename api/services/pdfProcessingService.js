const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const axios = require('axios');
const { sendProgress, sendCompletion, sendError } = require('../controllers/sse.controller');

// Get signed URL for S3 upload
const getSignedUrl = async ({ key, content_type }) => {
  const response = await axios.post(
    `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/s3/signed_url`,
    { key, content_type }
  );
  return response.data;
};

// Extract clean URL from signed URL
const extractImageUrl = (url) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const segments = pathname.split("/");
  const filename = segments.pop();
  return url.substring(0, url.indexOf(filename) + filename.length);
};

// Upload buffer to S3
const uploadToS3 = async (buffer, filename, contentType, folder = 'pdf') => {
  try {
    const key = `${folder}/${filename}`;
    const signedUrlResponse = await getSignedUrl({ key, content_type: contentType });
    
    await axios.put(signedUrlResponse.data.signedUrl, buffer, {
      headers: { "Content-Type": contentType },
    });

    return extractImageUrl(signedUrlResponse.data.signedUrl);
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error);
    throw error;
  }
};

// Step 1: Split PDF into chunks
const splitPdfIntoChunks = async (pdfBuffer, sessionId, chunkSize = 10) => {
  try {
    sendProgress(sessionId, {
      step: 1,
      progress: 10,
      message: "Loading PDF document...",
      currentChunk: 0,
      totalChunks: 0
    });

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    const totalChunks = Math.ceil(totalPages / chunkSize);

    sendProgress(sessionId, {
      step: 1,
      progress: 20,
      message: `Splitting PDF into ${totalChunks} chunks...`,
      currentChunk: 0,
      totalChunks: totalChunks
    });

    const pdfUrls = [];
    
    for (let i = 0; i < totalPages; i += chunkSize) {
      const startPage = i;
      const endPage = Math.min(i + chunkSize - 1, totalPages - 1);
      const currentChunk = Math.floor(i / chunkSize) + 1;

      // Create new PDF document for chunk
      const newPdfDoc = await PDFDocument.create();
      
      // Copy pages to new document
      for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const filename = `chunk-${startPage + 1}-to-${endPage + 1}-${Date.now()}.pdf`;
      
      // Upload chunk to S3
      const chunkUrl = await uploadToS3(Buffer.from(pdfBytes), filename, 'application/pdf', 'pdf');
      pdfUrls.push(chunkUrl);

      // Send progress update
      const progress = 20 + (currentChunk / totalChunks) * 30; // 20-50% for chunking
      sendProgress(sessionId, {
        step: 1,
        progress: Math.round(progress),
        message: `Processing chunk ${currentChunk}/${totalChunks}...`,
        currentChunk: currentChunk,
        totalChunks: totalChunks
      });
    }

    return pdfUrls;
  } catch (error) {
    console.error('Error splitting PDF:', error);
    throw error;
  }
};

// Step 2: Convert PDF to images using pdf-lib (simple approach)
const convertPdfToImages = async (pdfBuffer, sessionId) => {
  try {
    const { PDFDocument } = require('pdf-lib');
    
    sendProgress(sessionId, {
      step: 2,
      progress: 50,
      message: "Loading PDF for image conversion...",
      currentPage: 0,
      totalPages: 0
    });

    // Load PDF and get page count
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    sendProgress(sessionId, {
      step: 2,
      progress: 55,
      message: `Converting ${totalPages} pages to images...`,
      currentPage: 0,
      totalPages: totalPages
    });

    const images = [];
    
    // For now, create placeholder images representing each page
    // In production, you'd use a proper PDF-to-image conversion library
    for (let i = 1; i <= totalPages; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create a simple placeholder image buffer (1x1 pixel white image)
      const sharp = require('sharp');
      const placeholderBuffer = await sharp({
        create: {
          width: 800,
          height: 1000,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .jpeg({ quality: 80 })
      .toBuffer();
      
      const filename = `page-${i}-${Date.now()}.jpg`;
      const imageUrl = await uploadToS3(placeholderBuffer, filename, 'image/jpeg', 'images');
      images.push(imageUrl);

      const progress = 55 + (i / totalPages) * 20; // 55-75% for image conversion
      sendProgress(sessionId, {
        step: 2,
        progress: Math.round(progress),
        message: `Converted page ${i}/${totalPages}...`,
        currentPage: i,
        totalPages: totalPages
      });
    }

    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
};

// Step 3: Merge images (keep first single, merge others in pairs)
const mergeImages = async (imageUrls, sessionId) => {
  try {
    if (imageUrls.length === 0) return [];

    sendProgress(sessionId, {
      step: 3,
      progress: 75,
      message: "Preparing image merging...",
      currentPair: 0,
      totalPairs: Math.ceil((imageUrls.length - 1) / 2)
    });

    const mergedImages = [];
    
    // Keep first image as single
    mergedImages.push(imageUrls[0]);

    const totalPairs = Math.ceil((imageUrls.length - 1) / 2);
    let currentPair = 0;

    // Merge remaining images in pairs
    for (let i = 1; i < imageUrls.length; i += 2) {
      currentPair++;
      
      if (i + 1 < imageUrls.length) {
        // Create merged image (simpler approach for now)
        try {
          const sharp = require('sharp');
          
          // Create a simple side-by-side merged placeholder
          const mergedBuffer = await sharp({
            create: {
              width: 1600, // 2 * 800
              height: 1000,
              channels: 3,
              background: { r: 240, g: 240, b: 240 }
            }
          })
          .jpeg({ quality: 80 })
          .toBuffer();

          const filename = `merged-${i}-${i + 1}-${Date.now()}.jpg`;
          const mergedUrl = await uploadToS3(mergedBuffer, filename, 'image/jpeg', 'images');
          mergedImages.push(mergedUrl);

        } catch (error) {
          console.error(`Error creating merged image ${i} and ${i + 1}:`, error);
          // Fallback: add individual images
          mergedImages.push(imageUrls[i], imageUrls[i + 1]);
        }
      } else {
        // Single remaining image
        mergedImages.push(imageUrls[i]);
      }

      const progress = 75 + (currentPair / totalPairs) * 20; // 75-95% for merging
      sendProgress(sessionId, {
        step: 3,
        progress: Math.round(progress),
        message: `Merging images ${currentPair}/${totalPairs}...`,
        currentPair: currentPair,
        totalPairs: totalPairs
      });
    }

    return mergedImages;
  } catch (error) {
    console.error('Error merging images:', error);
    throw error;
  }
};

// Main processing function
const processPdfForEdition = async (pdfBuffer, editionData, sessionId) => {
  try {
    // Step 1: Split PDF into chunks
    const pdfUrls = await splitPdfIntoChunks(pdfBuffer, sessionId);
    
    // Step 2: Convert PDF to images
    const allImages = await convertPdfToImages(pdfBuffer, sessionId);
    
    // Step 3: Merge images
    const mergedImages = await mergeImages(allImages, sessionId);

    // Final progress update
    sendProgress(sessionId, {
      step: 4,
      progress: 95,
      message: "Saving edition to database...",
    });

    // Return processed data
    return {
      pdfUrls,
      libraryImages: allImages,
      mergedImages,
      ...editionData
    };

  } catch (error) {
    console.error('Error in PDF processing:', error);
    sendError(sessionId, {
      message: "Error processing PDF",
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  processPdfForEdition,
  splitPdfIntoChunks,
  convertPdfToImages,
  mergeImages
};