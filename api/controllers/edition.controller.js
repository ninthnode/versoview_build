const asyncHandler = require("express-async-handler");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
const { Channel } = require("../models/channel.model");
const { Bookmark } = require("../models/bookmark.model");
const { LibraryImage } = require("../models/libraryImage.model");

module.exports.createEdition = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user._id;
    const editionData = {
      userId: userId,
      editionText: data.edition,
      editionDescription: data.about,
      editionDate: data.date,
      pdfUrls: data.pdfUrls,
      genre: data.genre,
      subGenre: data.subGenre,
      size: data.size,
    };
    
    // Create and save the edition
    const newEdition = new Edition(editionData);
    await newEdition.save();
    
    // Save library images to the LibraryImage collection as well
    if (data.libraryImages && data.libraryImages.length > 0) {
      const libraryImagePromises = data.libraryImages.map((imageUrl, index) => {
      const order = data.libraryImages.length - 1 - index; // reverse the order
        const libraryImage = new LibraryImage({
          editionId: newEdition._id,
          userId: userId,
          imageUrl: imageUrl,
          order: order, // store the index
          isDefault: true, // optional flag if needed
        });
        return libraryImage.save();
      });

      await Promise.all(libraryImagePromises);
    }
    
    res.json({
      status: 201,
      message: "Edition created successfully",
    });
  } catch (error) {
    console.error("Error creating edition:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getAllEdition = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userEditions = await Edition.find({ userId: userId })
      .populate("postId")
      .sort({ createdAt: -1 })
      .lean();
  const editionsWithImage = await Promise.all(
      userEditions.map(async (edition) => {
        const firstImage = await LibraryImage.findOne({ editionId: edition._id })
          .sort({ createdAt: 1 }) // earliest image
          .lean();

        return {
          ...edition,
          firstImage: firstImage || null, // add image object or null if none
        };
      })
    );

    res.status(200).json({
      message: "Success",
      data: editionsWithImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports.getEditionsSize = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userEditions = await Edition.find({ userId: userId })
      .sort({ createdAt: -1 })
      .exec();

    // Ensure only valid numbers are summed
    let totalSize = userEditions.reduce((acc, doc) => {
      const docSize = Number(doc.size) || 0; // Convert to number, default to 0 if invalid
      return acc + docSize;
    }, 0);
    totalSize = totalSize.toFixed(2); // Convert to string with 2 decimal places
    res.status(200).json({
      message: "Success",
      data: totalSize,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports.getEditionById = asyncHandler(async (req, res) => {
  try {
    const editionId = req.params._id;
    const editionData = await Edition.findOne({ _id: editionId });
    const userId = req.user._id;

    if (!editionData) {
      console.log(`Edition not found for ID: ${editionId}`);
      return res.status(404).json({ message: "Edition not found" });
    }

    const postData = await Post.find({ editionId: editionId }).populate("channelId");
    const channelData = await Channel.findOne({ userId: editionData.userId });

    editionData._doc.channelData = channelData;

    const bookmark = await Bookmark.findOne({
      userId: userId,
      editionId: editionId,
    });
    let newData = {
      ...editionData.toObject(),
      isBookmarked: !!bookmark,
    };
    res.status(200).json({
      message: "Success",
      data: { editionData: newData, postData },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getPdf = asyncHandler(async (req, res) => {
  const { pageStart, pageEnd } = req.query;
  const { url } = req.params;
  const pdfUrl = decodeURIComponent(url);
  if (!pdfUrl) {
    return res.status(400).json({ error: "PDF URL is required" });
  }

  try {
    const pdfBytes = await extractPagesFromUrl(pdfUrl, +pageStart, +pageEnd);
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    // Return the base64 string as JSON
    res.status(200).json({
      success: true,
      data: pdfBase64,
      message: `Pages ${pageStart} to ${pageEnd} extracted successfully.`,
    });
  } catch (error) {
    console.error("Error fetching or processing PDF:", error);
    res.status(500).json({ error: "Failed to fetch or process PDF" });
  }
});

module.exports.getEditionsByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id;
    const editionData = await Edition.find({ userId: userId });

    const editionWithBookmarkStatus = await Promise.all(
      editionData.map(async (edition) => {
        const bookmark = await Bookmark.findOne({
          userId,
          editionId: edition._id,
        });
        return {
          ...edition.toObject(),
          isBookmarked: !!bookmark,
        };
      })
    );
    if (!editionData)
      return res.status(400).json({ message: `No Edition Found` });

    res
      .status(200)
      .json({ message: "Success", data: editionWithBookmarkStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.deleteEdition = async (req, res) => {
  try {
    const editionId = req.params._id;

    // Step 1: Find the edition
    const edition = await Edition.findById(editionId);
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }

    // Step 2: Delete associated posts
    if (edition.postId.length > 0) {
      await Post.deleteMany({ _id: { $in: edition.postId } });
      console.log("Deleted associated posts:", edition.postId);
    }

    // Step 3: Delete the edition
    await Edition.findByIdAndDelete(editionId);
    console.log("Deleted edition:", editionId);

    // Respond with success message
    res.status(200).json({ message: "Edition deleted successfully" });
  } catch (error) {
    console.error("Error deleting edition:", error);
    res
      .status(500)
      .json({ message: "Failed to delete edition", error: error.message });
  }
};
module.exports.uploadLibraryImage = async (req, res) => {
  try {
    if (!req.body.url) {
      return res.status(400).json({ 
        success: false,
        message: "Image URL is required" 
      });
    }

    const url = req.body.url;
    const editionId = req.params._id;
    const userId = req.user._id;

    const edition = await Edition.findById(editionId);
    if (!edition) {
      return res.status(404).json({ 
        success: false,
        message: "Edition not found" 
      });
    }

    // --- 🆕 Find the next order index ---
    const lastImage = await LibraryImage.find({ editionId })
    console.log(lastImage);

    // Add the new image URL to edition (if needed)
    if (!edition.uploadImages) {
      edition.uploadImages = [];
    }
    edition.uploadImages.unshift(url);
    await edition.save();

    // --- Create LibraryImage with order field ---
    const libraryImage = new LibraryImage({
      editionId,
      userId,
      imageUrl: url,
      order: lastImage.length, // ✅ Save with order
    });

    await libraryImage.save();

    // --- Sort by order for consistent response ---
    const libraryImages = await LibraryImage.find({ editionId }).sort({ order: -1 });

    res.status(200).json({ 
      success: true,
      message: "Library image uploaded successfully", 
      libraryImages: libraryImages,
    });
  } catch (error) {
    console.error("Error uploading library image:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};


module.exports.getLibraryImagesByEditionId = asyncHandler(async (req, res) => {
  try {
    const editionId = req.params._id;
    
    // Check if edition exists
    const edition = await Edition.findById(editionId);
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }
      // Get library images from the LibraryImage model
    const libraryImages = await LibraryImage.find({ editionId}).sort({ order: -1 });

    res.status(200).json({
      success: true,
      data: libraryImages,
      message: "Library images fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching library images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getLibraryImagesForPageTurner = asyncHandler(async (req, res) => {
  try {
    const editionId = req.params._id;
    
    // Check if edition exists
    const edition = await Edition.findById(editionId);
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }
      // Get library images from the LibraryImage model
    const libraryImages = await LibraryImage.find({ editionId, isDefault: true }).sort({ order: -1 });
    const imageUrls = libraryImages.map(img => img.imageUrl);

    res.status(200).json({
      success: true,
      data: imageUrls,
      message: "Library images fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching library images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

