const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const { spawn } = require('child_process');
const { sendProgress, sendError } = require('../controllers/sse.controller');
const { createPresignedPost } = require('../utils/s3');
const axios = require('axios');

// Detect available PDF processing capabilities
const detectPdfCapabilities = async () => {
  const capabilities = {
    poppler: false,
    pdfjs: false,
    canvas: false
  };

  // Check for poppler
  try {
    await new Promise((resolve, reject) => {
      const process = spawn('pdftocairo', ['-v']);
      process.on('close', (code) => {
        capabilities.poppler = (code === 0 || code === 99); // 99 is version info exit code
        resolve();
      });
      process.on('error', () => {
        capabilities.poppler = false;
        resolve();
      });
      setTimeout(() => {
        process.kill();
        resolve();
      }, 2000);
    });
  } catch (e) {
    capabilities.poppler = false;
  }

  // Check for pdfjs-dist
  try {
    require('pdfjs-dist');
    capabilities.pdfjs = true;
  } catch (e) {
    capabilities.pdfjs = false;
  }

  // Check for canvas
  try {
    require('canvas');
    capabilities.canvas = true;
  } catch (e) {
    capabilities.canvas = false;
  }

  return capabilities;
};

// Cache capabilities check
let cachedCapabilities = null;
const getCapabilities = async () => {
  if (!cachedCapabilities) {
    cachedCapabilities = await detectPdfCapabilities();
    console.log('PDF Processing Capabilities:', cachedCapabilities);
  }
  return cachedCapabilities;
};

// Upload buffer to S3
const uploadToS3 = async (buffer, filename, contentType, folder = 'pdf') => {
  try {
    const key = `public/${folder}/${filename}`;
    const s3Data = await createPresignedPost({ key, contentType });
    
    await axios.put(s3Data.signedUrl, buffer, {
      headers: { "Content-Type": contentType },
    });

    return s3Data.fileLink;
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error);
    throw error;
  }
};

// Poppler-based conversion (production)
const convertPageWithPoppler = async (pdfBuffer, pageNumber, scale = 800) => {
  return new Promise((resolve, reject) => {
    let processExited = false;
    let stdinClosed = false;
    
    const process = spawn('pdftocairo', [
      '-jpeg',
      '-singlefile',
      '-f', pageNumber.toString(),
      '-l', pageNumber.toString(),
      '-scale-to', scale.toString(),
      '-', '-'
    ]);

    const chunks = [];
    let errorOutput = '';

    process.on('error', (error) => {
      processExited = true;
      reject(new Error(`Failed to spawn pdftocairo: ${error.message}`));
    });

    process.stdout.on('data', chunk => chunks.push(chunk));
    process.stderr.on('data', chunk => errorOutput += chunk.toString());

    process.on('close', (code) => {
      processExited = true;
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`pdftocairo failed with code ${code}: ${errorOutput}`));
      }
    });

    process.stdin.on('error', (error) => {
      if (!processExited) {
        console.warn(`stdin error for page ${pageNumber}:`, error.message);
      }
    });

    process.on('spawn', () => {
      try {
        const chunkSize = 64 * 1024;
        let offset = 0;

        const writeChunk = () => {
          if (processExited || stdinClosed) return;
          
          if (offset >= pdfBuffer.length) {
            process.stdin.end();
            stdinClosed = true;
            return;
          }

          const chunk = pdfBuffer.slice(offset, offset + chunkSize);
          const canContinue = process.stdin.write(chunk);
          offset += chunkSize;

          if (canContinue) {
            setImmediate(writeChunk);
          } else {
            process.stdin.once('drain', writeChunk);
          }
        };

        writeChunk();
      } catch (writeError) {
        if (!processExited) {
          reject(new Error(`Failed to write to pdftocairo: ${writeError.message}`));
        }
      }
    });

    const timeout = setTimeout(() => {
      if (!processExited) {
        process.kill('SIGTERM');
        reject(new Error(`pdftocairo timeout for page ${pageNumber}`));
      }
    }, 30000);

    process.on('close', () => clearTimeout(timeout));
  });
};

// pdfjs-dist based conversion (development/fallback)
const convertPageWithPdfjs = async (pdfBuffer, pageNumber, scale = 3.0) => {
  try {
    let pdfjsLib;
    try {
      pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    } catch (e1) {
      pdfjsLib = require('pdfjs-dist');
    }
    
    const { createCanvas } = require('canvas');

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderTask = page.render({ canvasContext: context, viewport: viewport });
    await renderTask.promise;
    
    return canvas.toBuffer('image/jpeg', { quality: 0.85 });
  } catch (error) {
    console.error(`pdfjs conversion failed for page ${pageNumber}:`, error);
    throw error;
  }
};

// Create placeholder image
const createPagePlaceholder = async (pageNum, totalPages) => {
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
          <rect width="800" height="1000" fill="#fafafa" stroke="#ddd" stroke-width="2"/>
          <text x="400" y="450" font-family="Arial" font-size="32" fill="#888" text-anchor="middle">PDF Page ${pageNum}</text>
          <text x="400" y="500" font-family="Arial" font-size="18" fill="#aaa" text-anchor="middle">Conversion not available</text>
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

// Smart PDF to images conversion
const convertPdfToImages = async (pdfBuffer, totalPages, sessionId) => {
  const capabilities = await getCapabilities();
  const strategy = capabilities.poppler ? 'poppler' : 
                  (capabilities.pdfjs && capabilities.canvas) ? 'pdfjs' : 'placeholder';
  
  console.log(`Using PDF conversion strategy: ${strategy}`);
  
  sendProgress(sessionId, {
    step: 2,
    progress: 55,
    message: `Converting ${totalPages} PDF pages (${strategy})...`,
    totalPages: totalPages,
    strategy: strategy
  });

  const images = [];
  
  for (let i = 1; i <= totalPages; i++) {
    let imageBuffer;
    
    try {
      if (strategy === 'poppler') {
        imageBuffer = await convertPageWithPoppler(pdfBuffer, i);
        console.log(`Page ${i} converted with poppler`);
        
      } else if (strategy === 'pdfjs') {
        imageBuffer = await convertPageWithPdfjs(pdfBuffer, i);
        console.log(`Page ${i} converted with pdfjs`);
        
      } else {
        throw new Error('No conversion method available');
      }
      
    } catch (conversionError) {
      console.warn(`Primary conversion failed for page ${i}:`, conversionError.message);
      
      // Try fallback if primary failed
      try {
        if (strategy === 'poppler' && capabilities.pdfjs && capabilities.canvas) {
          imageBuffer = await convertPageWithPdfjs(pdfBuffer, i);
          console.log(`Page ${i} converted with pdfjs fallback`);
        } else {
          throw new Error('No fallback available');
        }
      } catch (fallbackError) {
        console.error(`All conversions failed for page ${i}, using placeholder`);
        imageBuffer = await createPagePlaceholder(i, totalPages);
      }
    }
    
    // Upload to S3
    const filename = `page-${i}-${Date.now()}.jpg`;
    const imageUrl = await uploadToS3(imageBuffer, filename, 'image/jpeg', 'images');
    images.push(imageUrl);

    const progress = 55 + (i / totalPages) * 20;
    sendProgress(sessionId, {
      step: 2,
      progress: Math.round(progress),
      message: `Converting page ${i}/${totalPages}...`,
      currentPage: i,
      totalPages: totalPages
    });
  }
  
  return images;
};

// Split PDF into chunks
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

    const pdfUrls = [];
    
    for (let i = 0; i < totalPages; i += chunkSize) {
      const startPage = i;
      const endPage = Math.min(i + chunkSize - 1, totalPages - 1);
      const currentChunk = Math.floor(i / chunkSize) + 1;

      const newPdfDoc = await PDFDocument.create();
      
      for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const filename = `chunk-${startPage + 1}-to-${endPage + 1}-${Date.now()}.pdf`;
      
      const chunkUrl = await uploadToS3(Buffer.from(pdfBytes), filename, 'application/pdf', 'pdf');
      pdfUrls.push(chunkUrl);

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

// Merge images (same as before)
const mergeImages = async (imageUrls, sessionId) => {
  try {
    if (imageUrls.length === 0) return [];

    const mergedImages = [];
    mergedImages.push(imageUrls[0]);

    const totalPairs = Math.ceil((imageUrls.length - 1) / 2);
    let currentPair = 0;

    for (let i = 1; i < imageUrls.length; i += 2) {
      currentPair++;
      
      if (i + 1 < imageUrls.length) {
        try {
          const [img1Response, img2Response] = await Promise.all([
            axios.get(imageUrls[i], { responseType: 'arraybuffer' }),
            axios.get(imageUrls[i + 1], { responseType: 'arraybuffer' })
          ]);

          const img1Buffer = Buffer.from(img1Response.data);
          const img2Buffer = Buffer.from(img2Response.data);
          
          const img1Info = await sharp(img1Buffer).metadata();
          const img2Info = await sharp(img2Buffer).metadata();

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
        mergedImages.push(imageUrls[i]);
      }

      const progress = 75 + (currentPair / totalPairs) * 20;
      sendProgress(sessionId, {
        step: 3,
        progress: Math.round(progress),
        message: `Merging images ${currentPair}/${totalPairs}...`,
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
    const { pdfUrls, totalPages } = await splitPdfIntoChunks(pdfBuffer, sessionId);
    const libraryImages = await convertPdfToImages(pdfBuffer, totalPages, sessionId);
    const mergedImages = await mergeImages(libraryImages, sessionId);

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
  processPdfForEdition,
  getCapabilities // Export for debugging
};