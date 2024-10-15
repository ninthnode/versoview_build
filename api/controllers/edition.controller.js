const asyncHandler = require("express-async-handler");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
const { Channel } = require("../models/channel.model");

module.exports.createEdition = asyncHandler(async (req, res) => {
    try {
      const data= req.body
      const userId = req.user._id;
      const editionData = {
        userId: userId,
        editionText: data.edition,
        editionDescription: data.about,
        editionDate: data.date,
        pdfUrl: data.pdfUrl,
        genre: data.genre,
        subGenre: data.subGenre,
      };
      const newEdition = new Edition(editionData);
      await newEdition.save();
      res.json({
        status: 201,
        message: "Edition created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
module.exports.getAllEdition = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userEditions = await Edition.find({userId: userId}).populate('postId')
    .exec();

    res.status(200).json({
      message: "Success",
      data: userEditions
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
    
    if (!editionData) {
      console.log(`Edition not found for ID: ${editionId}`);
      return res.status(404).json({ message: "Edition not found" });
    }
    
    const postData = await Post.find({ editionId: editionId });
    const channelData = await Channel.findOne({ userId: editionData.userId });

    editionData._doc.channelData = channelData;

    res.status(200).json({
      message: "Success",
      data: { editionData, postData }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getEditionsByUserId = asyncHandler(async (req, res) => {
	try {
	  const userId = req.params._id;
	  const editionData = await Edition.find({ userId: userId })
	  if (!editionData)
		return res
		  .status(400)
		  .json({ message: `No Edition Found` });
  
	  res.status(200).json({ message: "Success", data: editionData });
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
        return res.status(404).json({ message: 'Edition not found' });
      }
  
      // Step 2: Delete associated posts
      if (edition.postId.length > 0) {
        await Post.deleteMany({ _id: { $in: edition.postId } });
        console.log('Deleted associated posts:', edition.postId);
      }
  
      // Step 3: Delete the edition
      await Edition.findByIdAndDelete(editionId);
      console.log('Deleted edition:', editionId);
  
      // Respond with success message
      res.status(200).json({ message: 'Edition deleted successfully' });
    } catch (error) {
      console.error('Error deleting edition:', error);
      res.status(500).json({ message: 'Failed to delete edition', error: error.message });
    }
  };
   