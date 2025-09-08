const asyncHandler = require("express-async-handler");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
const { Channel } = require("../models/channel.model");
const { Bookmark } = require("../models/bookmark.model");
const { LibraryImage } = require("../models/libraryImage.model");
const { PostImages } = require("../models/postImages.model");
const e = require("express");

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
          .populate({
            path: 'postId',
            populate: {
              path: 'channelId' // this populates channelID inside the post
            }
          })
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
    const { postId, editionId } = req.query;

    let allImages = [];
    // Handle normal posts (postId provided and not "null" string)
    if (postId && postId !== "null" && postId !== null) {
      console.log("Fetching images for postId:", postId);
      // Get post-specific images
      const postImages = await PostImages.findOne({ postId });
      if (postImages && postImages.images) {
        allImages = [...allImages, ...postImages.images];
      }
    }

    // Handle edition posts (editionId provided)
    if (editionId) {
      // Check if edition exists
      const edition = await Edition.findById(editionId);
      if (edition) {
        // Get edition-specific images from PostImages (new approach)
        const editionPostImages = await PostImages.findOne({ editionId });
        if (editionPostImages && editionPostImages.images) {
          allImages = [...allImages, ...editionPostImages.images];
        }
        
        // Also get merged images from library (legacy support)
        const libraryImages = await LibraryImage.findOne({ editionId });
        if (libraryImages && libraryImages.mergedImages) {
          allImages = [...allImages, ...libraryImages.mergedImages];
        }
      }
    }

    // If neither postId nor editionId provided, return error
    if ((!postId || postId === "null") && !editionId) {
      return res.status(400).json({
        success: false,
        message: "Post ID or Edition ID is required",
      });
    }

    // Remove duplicates
    const uniqueImages = [...new Set(allImages)];

    res.status(200).json({
      success: true,
      images: uniqueImages,
      message: "Library images fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching library images:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error" 
    });
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
    const libraryImages = await LibraryImage.findOne({ editionId });

const flatImageArray = [
      ...(libraryImages.allImages || [])
        .filter((img) => img.isDefault === true)
        .map((img) => img.url),
    ];
      res.status(200).json({
        success: true,
        data: flatImageArray,
        message: "Library images fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching library images:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports.uploadPostImage = asyncHandler(async (req, res) => {
  try {
    const { postId, editionId, url } = req.body;

    // Require either postId or editionId
    if (!postId && !editionId) {
      return res.status(400).json({
        success: false,
        message: "Post ID or Edition ID is required",
      });
    }

    // Validate the referenced document exists
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
    }

    if (editionId) {
      const edition = await Edition.findById(editionId);
      if (!edition) {
        return res.status(404).json({
          success: false,
          message: "Edition not found",
        });
      }
    }

    // Find existing postImages by postId or editionId
    let query = {};
    if (postId) query.postId = postId;
    if (editionId) query.editionId = editionId;
    
    let postImages = await PostImages.findOne(query);

    if (postImages) {
      postImages.images = [...postImages.images, ...url];
      await postImages.save();
    } else {
      const newPostImagesData = {
        images: url, // Assuming url is an array of image URLs
      };
      
      if (postId) newPostImagesData.postId = postId;
      if (editionId) newPostImagesData.editionId = editionId;
      
      postImages = new PostImages(newPostImagesData);
      await postImages.save();
    }

    res.status(200).json({
      success: true,
      message: "Post images uploaded successfully",
      data: postImages,
    });
  } catch (error) {
    console.error("Error uploading post images:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports.getPostImages = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    // Get post images from PostImages model
    const postImages = await PostImages.findOne({ postId });
    
    // If post has an edition, also get merged images from library
    const post = await Post.findById(postId);
    let allImages = [];
    
    // Add post-specific images
    if (postImages && postImages.images) {
      allImages = [...allImages, ...postImages.images];
    }
    
    // If it's an edition post, also include merged images from library
    if (post && post.editionId) {
      const libraryImages = await LibraryImage.findOne({ editionId: post.editionId });
      if (libraryImages && libraryImages.mergedImages) {
        allImages = [...allImages, ...libraryImages.mergedImages];
      }
    }

    // Remove duplicates
    const uniqueImages = [...new Set(allImages)];

    res.status(200).json({
      success: true,
      images: uniqueImages,
      message: "Post images fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching post images:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
