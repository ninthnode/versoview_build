const asyncHandler = require("express-async-handler");
const { Post } = require("../models/post.model");
const { Edition } = require("../models/edition.model");
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
    const userEditions = await Edition.find({userId: userId})

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
    const postData = await Post.find({ editionId: editionId })
    if (!editionData) {
      console.log(`edition not found for ID: ${editionId}`);
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Success", data: {editionData,postData} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
