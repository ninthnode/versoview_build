const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const axios = require('axios');
const { sendProgress, sendCompletion, sendError } = require('../controllers/sse.controller');

// Use existing S3 utilities
const { createPresignedPost } = require('../utils/s3');

// Get signed URL using existing S3 setup
const getSignedUrlData = async ({ key, content_type }) => {
  try {
    const data = await createPresignedPost({ key, contentType: content_type });
    return data;
  } catch (error) {
    console.error(`Failed to get signed URL for ${key}:`, error.message);
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }
};

// Upload buffer to S3 using existing setup
const uploadToS3 = async (buffer, filename, contentType, folder = 'pdf') => {
  try {
    const key = `public/${folder}/${filename}`;
    const signedUrlData = await getSignedUrlData({ key, content_type: contentType });
    
    await axios.put(signedUrlData.signedUrl, buffer, {
      headers: { "Content-Type": contentType },
    });

    return signedUrlData.fileLink;
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error.message);
    throw error;
  }
};

// Step 1: Split PDF into chunks and upload to S3
const splitPdfIntoChunks = async (pdfBuffer, sessionId, chunkSize = 10) => {
  try {
    sendProgress(sessionId, {
      step: 1,
      progress: 10,
      message: "Loading PDF document...",
    });

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    const totalChunks = Math.ceil(totalPages / chunkSize);

    sendProgress(sessionId, {
      step: 1,
      progress: 20,
      message: `Splitting PDF into ${totalChunks} chunks...`,
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
      const progress = 20 + (currentChunk / totalChunks) * 30;
      sendProgress(sessionId, {
        step: 1,
        progress: Math.round(progress),
        message: `Processing chunk ${currentChunk}/${totalChunks}...`,
        currentChunk: currentChunk,
        totalChunks: totalChunks
      });
    }

    return { pdfUrls, totalPages };
  } catch (error) {
    console.error('Error splitting PDF:', error);
    throw error;
  }
};

// Step 2: Convert PDF to images using pdfjs-dist and canvas (same as frontend)
const convertPdfToImages = async (pdfBuffer, totalPages, sessionId) => {
  try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const { createCanvas } = require('canvas');

    sendProgress(sessionId, {
      step: 2,
      progress: 55,
      message: `Converting ${totalPages} PDF pages to images using pdfjs-dist...`,
      totalPages: totalPages
    });

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer)
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const images = [];

    // Function to render a single page as an image
    const renderPage = async (pageNum, scale = 3.0) => {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        const renderTask = page.render({ 
          canvasContext: context, 
          viewport: viewport 
        });
        
        await renderTask.promise;
        const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
        return imageBuffer;
        
      } catch (pageError) {
        console.error(`Error rendering page ${pageNum}:`, pageError);
        throw pageError;
      }
    };

    // Function to compress image if needed
    const compressImageIfNeeded = async (imageBuffer, maxSizeMB = 1) => {
      const maxSize = maxSizeMB * 1024 * 1024;
      
      if (imageBuffer.length > maxSize) {
        const compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 75 })
          .toBuffer();
        return compressedBuffer;
      }
      
      return imageBuffer;
    };

    // Process each page (same approach as frontend)
    for (let i = 1; i <= numPages; i++) {
      try {
        // Render page to image
        let imageBuffer = await renderPage(i);
        
        // Compress if needed
        imageBuffer = await compressImageIfNeeded(imageBuffer, 1);
        
        // Upload to S3
        const filename = `page-${i}-${Date.now()}.jpg`;
        const imageUrl = await uploadToS3(imageBuffer, filename, 'image/jpeg', 'images');
        images.push(imageUrl);

        const progress = 55 + (i / numPages) * 20;
        sendProgress(sessionId, {
          step: 2,
          progress: Math.round(progress),
          message: `Converting page ${i}/${numPages}...`,
          currentPage: i,
          totalPages: numPages
        });
        
      } catch (pageError) {
        console.error(`Failed to convert page ${i}:`, pageError);
        
        // Create fallback for this page
        const fallbackBuffer = await createPageFallback(i, numPages);
        const filename = `page-${i}-fallback-${Date.now()}.jpg`;
        const imageUrl = await uploadToS3(fallbackBuffer, filename, 'image/jpeg', 'images');
        images.push(imageUrl);
      }
    }

    return images;

  } catch (error) {
    console.error('PDF to image conversion failed:', error);
    return createEnhancedPlaceholders(totalPages, sessionId);
  }
};


// Helper function to create a single page fallback
const createPageFallback = async (pageNum, totalPages) => {
  return await sharp({
    create: {
      width: 800,
      height: 1000,
      channels: 3,
      background: { r: 250, g: 250, b: 250 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="800" height="1000">
          <rect width="800" height="1000" fill="#fafafa" stroke="#ddd" stroke-width="1"/>
          <text x="400" y="450" font-family="Arial" font-size="32" fill="#888" text-anchor="middle">PDF Page ${pageNum}</text>
          <text x="400" y="500" font-family="Arial" font-size="18" fill="#aaa" text-anchor="middle">Could not convert to image</text>
          <text x="400" y="550" font-family="Arial" font-size="14" fill="#ccc" text-anchor="middle">Page ${pageNum} of ${totalPages}</text>
        </svg>
      `),
      top: 0,
      left: 0
    }
  ])
  .jpeg({ quality: 80 })
  .toBuffer();
};

// Enhanced placeholder function
const createEnhancedPlaceholders = async (totalPages, sessionId) => {
  const images = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const placeholderBuffer = await createPageFallback(i, totalPages);
    
    const filename = `page-${i}-enhanced-${Date.now()}.jpg`;
    const imageUrl = await uploadToS3(placeholderBuffer, filename, 'image/jpeg', 'images');
    images.push(imageUrl);
    
    const progress = 55 + (i / totalPages) * 20;
    sendProgress(sessionId, {
      step: 2,
      progress: Math.round(progress),
      message: `Created enhanced placeholder ${i}/${totalPages}...`,
      currentPage: i,
      totalPages: totalPages
    });
  }
  
  return images;
};

// Step 3: Merge images and upload to S3
const mergeImages = async (imageUrls, sessionId) => {
  try {
    if (imageUrls.length === 0) return [];

    const totalPairs = Math.ceil((imageUrls.length - 1) / 2);
    sendProgress(sessionId, {
      step: 3,
      progress: 75,
      message: "Starting image merging...",
      totalPairs: totalPairs
    });

    const mergedImages = [];
    
    // Keep first image as single
    mergedImages.push(imageUrls[0]);

    let currentPair = 0;
    
    // Merge remaining images in pairs
    for (let i = 1; i < imageUrls.length; i += 2) {
      currentPair++;
      
      if (i + 1 < imageUrls.length) {
        // Download and merge two actual images
        try {
          // Download both images
          const [img1Response, img2Response] = await Promise.all([
            axios.get(imageUrls[i], { responseType: 'arraybuffer' }),
            axios.get(imageUrls[i + 1], { responseType: 'arraybuffer' })
          ]);

          const img1Buffer = Buffer.from(img1Response.data);
          const img2Buffer = Buffer.from(img2Response.data);

          const img1Info = await sharp(img1Buffer).metadata();
          const img2Info = await sharp(img2Buffer).metadata();

          // Create merged image (side by side)
          const mergedBuffer = await sharp({
            create: {
              width: img1Info.width + img2Info.width,
              height: Math.max(img1Info.height, img2Info.height),
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          })
          .composite([
            { input: img1Buffer, left: 0, top: 0 },
            { input: img2Buffer, left: img1Info.width, top: 0 }
          ])
          .jpeg({ quality: 85 })
          .toBuffer();

          const filename = `merged-${i}-${i + 1}-${Date.now()}.jpg`;
          const mergedUrl = await uploadToS3(mergedBuffer, filename, 'image/jpeg', 'images');
          mergedImages.push(mergedUrl);
          
        } catch (mergeError) {
          console.error(`Error merging images ${i} and ${i + 1}:`, mergeError);
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
    // Step 1: Split PDF into chunks and upload
    const { pdfUrls, totalPages } = await splitPdfIntoChunks(pdfBuffer, sessionId);
    
    // Step 2: Convert PDF to actual images and upload
    const libraryImages = await convertPdfToImages(pdfBuffer, totalPages, sessionId);
    
    // Step 3: Merge images and upload
    const mergedImages = await mergeImages(libraryImages, sessionId);

    // Final progress update
    sendProgress(sessionId, {
      step: 4,
      progress: 95,
      message: "Saving to database...",
    });

    return {
      pdfUrls,
      libraryImages,
      mergedImages,
      ...editionData
    };

  } catch (error) {
    console.error('Error in PDF processing:', error);
    sendError(sessionId, {
      message: "Error processing PDF: " + error.message,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  processPdfForEdition
};