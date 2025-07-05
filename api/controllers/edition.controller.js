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
    console.log(data.libraryImages);
    //save library images
    if (data.libraryImages && Array.isArray(data.libraryImages)) {
      const sanitizedImages = data.libraryImages.map((img) => ({
        url: img,
        isDefault: true, // force boolean true/false
      }));

      const libraryImageEntry = new LibraryImage({
        editionId: newEdition._id,
        userId: userId,
        allImages: sanitizedImages,
        mergedImages: data.mergedImages || [],
      });

      await libraryImageEntry.save();
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
          const firstImage = await LibraryImage.findOne({
            editionId: edition._id, // edition._id is already a string/hex with .lean()
          }).lean(); // optional, if you don't need full Mongoose doc

          return {
            ...edition,
            firstImage: firstImage?.mergedImages?.[0] ?? null,
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

    const postData = await Post.find({ editionId: editionId }).populate(
      "channelId"
    );
    const channelData = await Channel.findOne({ userId: editionData.userId });

    editionData._doc.channelData = channelData;

    const bookmark = await Bookmark.findOne({
      userId: userId,
      editionId: editionId,
    });
    const firstImage = await LibraryImage.findOne({
            editionId: editionId, // edition._id is already a string/hex with .lean()
          }).lean(); // optional, if you don't need full Mongoose doc

    let newData = {
      ...editionData.toObject(),
      isBookmarked: !!bookmark,
                firstImage: firstImage?.mergedImages?.[0] ?? null,

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
    const editionData = await Edition.find({ userId: userId }) .sort({ createdAt: -1 })
        .lean();

    const editionWithBookmarkStatus = await Promise.all(
      editionData.map(async (edition) => {
        const bookmark = await Bookmark.findOne({
          userId,
          editionId: edition._id,
        });
         const firstImage = await LibraryImage.findOne({
            editionId: edition._id, // edition._id is already a string/hex with .lean()
          }).lean(); // optional, if you don't need full Mongoose doc

        return {
          ...edition,
          isBookmarked: !!bookmark,
          firstImage: firstImage?.mergedImages?.[0] ?? null,
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
        message: "Image URL is required",
      });
    }

    const url = req.body.url;
    const editionId = req.params._id;

    // --- 🆕 Find the next order index ---
    const libraryImages = await LibraryImage.findOne({ editionId });

    // Push the new image with isDefault: false
    libraryImages.allImages.push({
      url: url,
      isDefault: false,
    });

    await libraryImages.save();
    const flatImageArray = [
      ...(libraryImages.allImages || [])
        .filter((img) => img.isDefault === false)
        .reverse()
        .map((img) => img.url),
      ...(libraryImages.mergedImages || []),
    ];
    res.status(200).json({
      success: true,
      message: "Library image uploaded successfully",
      libraryImages: flatImageArray,
    });
  } catch (error) {
    console.error("Error uploading library image:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.getLibraryImagesByEditionId = asyncHandler(async (req, res) => {
  try {
    const editionId = req.params._id;

    // Find the library image document by editionId
    const libraryImages = await LibraryImage.findOne({ editionId });

    if (!libraryImages) {
      return res
        .status(404)
        .json({ error: "No images found for this edition." });
    }

    // Build flat array
    const flatImageArray = [
      ...(libraryImages.allImages || [])
        .filter((img) => img.isDefault === false)
        .reverse()
        .map((img) => img.url),
      ...(libraryImages.mergedImages || []),
    ];
    res.json({ images: flatImageArray });
  } catch (error) {
    console.error("Error fetching library images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getLibraryImagesForPageTurner = asyncHandler(
  async (req, res) => {
    try {
      const editionId = req.params._id;

      // Check if edition exists
      const edition = await Edition.findById(editionId);
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      // Get library images from the LibraryImage model
      const libraryImages = await LibraryImage.find({
        editionId,
        isDefault: true,
      }).sort({ order: -1 });
      const imageUrls = libraryImages.map((img) => img.imageUrl);

      res.status(200).json({
        success: true,
        data: imageUrls,
        message: "Library images fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching library images:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
