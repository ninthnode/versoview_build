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
    
    // Warn if no conversion methods are available
    if (!cachedCapabilities.poppler && !(cachedCapabilities.pdfjs && cachedCapabilities.canvas)) {
      console.warn('⚠️  WARNING: No PDF conversion methods available!');
      console.warn('   Placeholder images will be used. To fix:');
      console.warn('   - Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/ (Windows)');
      console.warn('   - Or install Canvas dependencies: npm install canvas (requires build tools)');
      console.warn('   See README.md for detailed installation instructions.');
    } else if (!cachedCapabilities.poppler) {
      console.log('ℹ️  Using pdfjs+canvas fallback (slower than Poppler)');
      console.log('   For better performance, install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/');
    }
  }
  return cachedCapabilities;
};

// Optimize image with sharp for better quality-to-size ratio
const optimizeImage = async (imageBuffer, quality = 96, skipIfAlreadyOptimized = false) => {
  try {
    // Check if image is already a JPEG with high quality - if so, skip re-encoding to avoid quality loss
    if (skipIfAlreadyOptimized) {
      const metadata = await sharp(imageBuffer).metadata();
      // If it's already JPEG and we're trying to maintain quality, just return as-is
      // Re-encoding JPEG causes quality loss even at same quality level
      if (metadata.format === 'jpeg') {
        return imageBuffer;
      }
    }
    
    // Use sharp to optimize the image with better compression settings
    // Progressive JPEG provides better perceived quality and compression
    const optimized = await sharp(imageBuffer)
      .jpeg({ 
        quality: quality,
        progressive: true // Progressive JPEG for better perceived quality and compression
      })
      .toBuffer();
    
    return optimized;
  } catch (error) {
    console.warn('Image optimization failed, using original:', error.message);
    return imageBuffer; // Fallback to original if optimization fails
  }
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
// Use higher resolution and PNG format to avoid quality loss, then convert to high-quality JPEG
const convertPageWithPoppler = async (pdfBuffer, pageNumber, scale = 2400) => {
  return new Promise((resolve, reject) => {
    let processExited = false;
    let stdinClosed = false;
    
    // Use PNG format first to avoid quality loss, then convert to high-quality JPEG
    const process = spawn('pdftocairo', [
      '-png', // Use PNG to avoid quality loss from JPEG compression
      '-singlefile',
      '-f', pageNumber.toString(),
      '-l', pageNumber.toString(),
      '-scale-to', scale.toString(), // Increased from 800 to 2400 for higher resolution
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

    process.on('close', async (code) => {
      processExited = true;
      if (code === 0 && chunks.length > 0) {
        const pngBuffer = Buffer.concat(chunks);
        // Convert PNG to high-quality JPEG to avoid double compression
        try {
          const jpegBuffer = await sharp(pngBuffer)
            .jpeg({ 
              quality: 100, // Maximum quality
              progressive: true
            })
            .toBuffer();
          resolve(jpegBuffer);
        } catch (sharpError) {
          // If sharp conversion fails, return PNG buffer (will be converted later)
          resolve(pngBuffer);
        }
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
// Increased scale for higher resolution
const convertPageWithPdfjs = async (pdfBuffer, pageNumber, scale = 4.0) => {
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
    
    // Use maximum quality (0.98) - will be further optimized by optimizeImage function
    return canvas.toBuffer('image/jpeg', { quality: 0.98 });
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
  .jpeg({ 
    quality: 85,
    progressive: true
  })
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
    
    // Check if image is already JPEG from Poppler conversion
    // If it's PNG (from Poppler), convert to high-quality JPEG
    // If it's already JPEG, skip re-encoding to avoid quality loss
    let optimizedBuffer;
    try {
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`Page ${i} image format: ${metadata.format}, size: ${metadata.width}x${metadata.height}`);
      
      if (metadata.format === 'png') {
        // Convert PNG to high-quality JPEG (single conversion, no quality loss)
        console.log(`Converting PNG to JPEG at quality 100 for page ${i}`);
        optimizedBuffer = await sharp(imageBuffer)
          .jpeg({ 
            quality: 100, // Maximum quality
            progressive: true
          })
          .toBuffer();
      } else if (metadata.format === 'jpeg') {
        // Already JPEG from Poppler - don't re-encode to avoid quality loss
        console.log(`Page ${i} already JPEG, skipping re-encoding to preserve quality`);
        optimizedBuffer = imageBuffer;
      } else {
        // Other format - convert with maximum quality
        console.log(`Converting ${metadata.format} to JPEG at quality 100 for page ${i}`);
        optimizedBuffer = await optimizeImage(imageBuffer, 100);
      }
    } catch (error) {
      console.warn(`Error processing page ${i} image:`, error.message);
      // Fallback to optimization if metadata check fails
      optimizedBuffer = await optimizeImage(imageBuffer, 100);
    }
    
    // Upload to S3
    const filename = `page-${i}-${Date.now()}.jpg`;
    const imageUrl = await uploadToS3(optimizedBuffer, filename, 'image/jpeg', 'images');
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
          
          // Get metadata first to check image properties
          const img1Info = await sharp(img1Buffer).metadata();
          const img2Info = await sharp(img2Buffer).metadata();
          
          // Use images directly - sharp will handle the merge without quality loss
          // No need to pre-process as sharp's composite operation preserves quality

          // Merge images with maximum quality settings
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
          .jpeg({ 
            quality: 100, // Maximum quality for merged images to preserve all detail
            progressive: true // Progressive encoding for better compression
          })
          .toBuffer();

          console.log(`Merged images ${i}-${i+1} at quality 100, size: ${img1Info.width + img2Info.width}x${Math.max(img1Info.height, img2Info.height)}`);
          
          // Don't re-optimize merged images - they're already at maximum quality
          // Re-encoding JPEG causes quality loss even at the same quality level
          // The merged buffer is already optimized with progressive encoding
          const optimizedMergedBuffer = mergedBuffer;

          const filename = `merged-${i}-${i + 1}-${Date.now()}.jpg`;
          const mergedUrl = await uploadToS3(optimizedMergedBuffer, filename, 'image/jpeg', 'images');
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