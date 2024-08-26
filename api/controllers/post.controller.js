const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Vote } = require("../models/vote.model");
const { CommentVote } = require("../models/commentVote.model");
const { CommentReply } = require("../models/replytocomment.model");
const { Post } = require("../models/post.model");
const { Channel } = require("../models/channel.model");
const { User } = require("../models/user.model");
const { Bookmark } = require("../models/bookmark.model");
const { Favorite } = require("../models/favorite.model");
const { PostComment } = require("../models/postcomment.model");
const { RecentlyViewedPosts } = require("../models/recentlyViewedPosts.model");
// const PdfExtractor = require("pdf-extractor").PdfExtractor;
const { PostCommentReply } = require("../models/postcomment.replies.model");
const { UnreadPost } = require("../models/unreadPost.model");
const fs = require("node:fs");
const path = require("node:path");
const fse = require("fs-extra");
const { Follow } = require("../models/follow.model");

// get all pdf images
function getAllImageFiles(folder) {
  const files = fs.readdirSync(folder);
  return files.filter((file) => {
    return /\.(jpg|jpeg|png)$/i.test(file);
  });
}

// Create post
module.exports.create = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const channelData = await Channel.findOne({ userId });
    const channelId = channelData._id;

    const postData = {
      channelId: channelId,
      userId: userId,
      mainImageURL: req.body.mainImageURL || "",
      section: req.body.section || "",
      subSection: req.body.subSection || "",
      header: req.body.header || "",
      standFirst: req.body.standFirst || "",
      credits: req.body.credits || "",
      bodyRichText: req.body.bodyRichText || "",
      status: req.body.status || "",
    };

    const newPost = new Post(postData);
    newPost.readBy.push(userId);
    await newPost.save();

    // Update userType to 'publisher'
    await User.findByIdAndUpdate(userId, { userType: "publisher" });

    // const postId = newPost._id;

    // Create unread post for the user
    // const unreadPostData = {
    //   postId,
    //   userId,
    //   channelId,
    //   readPost: false,
    // };

    // const newUnreadPost = new UnreadPost(unreadPostData);
    // await newUnreadPost.save();

    res.status(201);
    res.json({
      status: 201,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// module.exports.getAllPost = asyncHandler(async (req, res) => {
//   try {
//     const postData = await Post.find().populate("channelId").sort({ createdAt: -1 });
//     res.status(200);
//     res.json({ message: "Success", data: postData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// Get all post

function calculateReadingTime(text, time = 250) {
  let words = text.trim().match(/\S+/g) || [];
  let wordCount = words.length;
  let totalMinutes = wordCount / time;
  
  totalMinutes = Math.ceil(totalMinutes);
  
  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;

  if (hours > 0) {
      return `${hours}.${minutes < 10 ? '0' : ''}${minutes}hrs`;
  } else {
    if(minutes<1)
      return `${minutes} mins`;
    else
      return `${minutes} min`;
  }
}

module.exports.getAllPost = asyncHandler(async (req, res) => {
  try {
    // LOGIC
    // 1. Followed channel post
    // 2. User's post
    // 3. Genre 
    // 4. Find Unique Posts

    const userId = req.user._id;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userData = await User.findOne({ _id: userId });

    const userPosts = await Post.find({userId: userData._id}).populate("channelId");

    const genres = userData.genre;

    const userFollows = await Follow.find({ userId }).exec();

    const followedChannelIds = userFollows.map((follow) => follow.channelId);
    const postDataGenre = await Post.find({
      section: { $in: genres },
    }).populate("channelId");
    const postFollowedchannel = await Post.find({
      channelId: { $in: followedChannelIds },
    }).populate("channelId");

    let combinedPosts = [...postDataGenre,...userPosts, ...postFollowedchannel];

    const uniquePosts = Array.from(
      new Map(combinedPosts.map((post) => [post._id.toString(), post])).values()
    );

    const finalPosts = uniquePosts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    const postsWithBookmarkStatus = await Promise.all(
      finalPosts.map(async (post) => {
        const bookmark = await Bookmark.findOne({ userId, postId: post._id });
        return {
          ...post.toObject(),
          isBookmarked: !!bookmark,
          readingTime: calculateReadingTime(post.bodyRichText),
        };
      })
    );

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      message: "Success",
      data: postsWithBookmarkStatus,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getPostIfUserNotLoggedIn = asyncHandler(async (req, res) => {
  try {
    const postId = process.env.ADMIN_USER_ID;

    const postData = await Post.find({ userId: postId })
      .populate("channelId")
      .sort({ createdAt: -1 });
      let newpostData = postData.map((p)=>{
        return {
          ...p.toObject(),
          readingTime: calculateReadingTime(p.bodyRichText),
        }
      })

    res.status(200).json({
      message: "Success",
      data: newpostData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getPostById = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;
    const mainuserId = req.user._id;
    await addRecentlyViewedPost(mainuserId, postId);
    // Fetch post data
    const postData = await Post.findOne({ _id: postId });
    if (!postData) {
      console.log(`Post not found for ID: ${postId}`);
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch channel data
    const channelId = postData.channelId;
    if (!channelId) {
      console.log(`Channel ID not found in post data: ${postData}`);
      return res
        .status(404)
        .json({ message: "Channel ID not found in post data" });
    }

    const channelData = await Channel.findOne({ _id: channelId });
    if (!channelData) {
      console.log(`Channel not found for ID: ${channelId}`);
      return res.status(404).json({ message: "Channel not found" });
    }

    // Fetch user data
    const userId = channelData.userId;
    if (!userId) {
      console.log(`User ID not found in channel data: ${channelData}`);
      return res
        .status(404)
        .json({ message: "User ID not found in channel data" });
    }

    const userData = await User.findOne({ _id: userId });
    if (!userData) {
      console.log(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const votes = await Vote.find({ postId: postId });
    const voteCounts = votes.reduce(
      (counts, vote) => {
        if (vote.voteType === true) {
          counts.trueCount++;
        } else if (vote.voteType === false) {
          counts.falseCount++;
        }
        return counts;
      },
      { trueCount: 0, falseCount: 0 }
    );
    const bookmark = await Bookmark.findOne({
      userId: mainuserId,
      postId: postId,
    });

    // Combine all the data
    const combinedData = {
      post: postData,
      channel: channelData,
      user: userData,
      votes: voteCounts,
      isBookmarked: !!bookmark,
      readingTime: calculateReadingTime(postData.bodyRichText),
    };

    const postIfUserAlreadyRead = await Post.findOne({
      _id: postId,
      readBy: mainuserId,
    });
    // Add the current userId to Post.readBy
    if (!postIfUserAlreadyRead) {
      postData.readBy.push(mainuserId);
      await postData.save();
    }

    res.status(200).json({ message: "Success", data: combinedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getPostByIdLoggedOut = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;
    // Fetch post data
    const postData = await Post.findOne({ _id: postId });
    if (!postData) {
      console.log(`Post not found for ID: ${postId}`);
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch channel data
    const channelId = postData.channelId;
    if (!channelId) {
      console.log(`Channel ID not found in post data: ${postData}`);
      return res
        .status(404)
        .json({ message: "Channel ID not found in post data" });
    }

    const channelData = await Channel.findOne({ _id: channelId });
    if (!channelData) {
      console.log(`Channel not found for ID: ${channelId}`);
      return res.status(404).json({ message: "Channel not found" });
    }

    // Fetch user data
    const userId = channelData.userId;
    if (!userId) {
      console.log(`User ID not found in channel data: ${channelData}`);
      return res
        .status(404)
        .json({ message: "User ID not found in channel data" });
    }

    const userData = await User.findOne({ _id: userId });
    if (!userData) {
      console.log(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const votes = await Vote.find({ postId: postId });
    const voteCounts = votes.reduce(
      (counts, vote) => {
        if (vote.voteType === true) {
          counts.trueCount++;
        } else if (vote.voteType === false) {
          counts.falseCount++;
        }
        return counts;
      },
      { trueCount: 0, falseCount: 0 }
    );
    const comments = await PostComment.find({ postId: postId });

    // Combine all the data
    const combinedData = {
      post: postData,
      channel: channelData,
      user: userData,
      votes: voteCounts,
      commentsCount: comments.length,
    };

    res.status(200).json({ message: "Success", data: combinedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get posts by channel id
module.exports.getPostByChannelId = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params._id;
    const userId = req.user._id;

    const postData = await Post.find({ channelId: channelId }).populate(
      "channelId"
    );

    const postsWithBookmarkStatus = await Promise.all(
      postData.map(async (post) => {
        const bookmark = await Bookmark.findOne({ userId, postId: post._id });
        return {
          ...post.toObject(),
          isBookmarked: !!bookmark,
        };
      })
    );

    if (!postData)
      return res
        .status(400)
        .json({ message: `No Post Found for Channel id ${channelId}` });

    res.status(200).json({ message: "Success", data: postsWithBookmarkStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update post
module.exports.updatePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;
    const isPostExist = await Post.findOne({_id:postId});

    if (!isPostExist) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Post updated successfully", data: updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete post
module.exports.deletePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;
    console.log(postId)
    
    const postToDelete = await Post.find({_id:postId });
    
    if (!postToDelete) {
      return res.status(404).json({ error: "Post not found" });
    }
    await Post.findOneAndDelete({_id:postId });
    res
      .status(200)
      .json({ message: "Post deleted successfully", data: postToDelete });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Upvote post
module.exports.upvotePost = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params._id;

    const isAlreadyVoted = await Vote.findOne({
      votingUserId: userId,
      postId: postId,
    });
    if (isAlreadyVoted && isAlreadyVoted.voteType === true) {
      await Vote.findOneAndDelete({
        votingUserId: userId,
        postId: postId,
      });
      return res.status(200).json({ status: 400, message: "vote removed" });
    }
    if (isAlreadyVoted && isAlreadyVoted.voteType === false) {
      isAlreadyVoted.voteType = true;
      await isAlreadyVoted.save();
      return res.status(200).json({ status: 200, message: "upvoted" });
    }
    const newVote = new Vote({
      votingUserId: userId,
      postId: postId,
      voteType: true,
    });

    await newVote.save();
    return res
      .status(201)
      .json({ status: 201, message: "upvoted", data: newVote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Downvote post
module.exports.downvotePost = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params._id;

    const isAlreadyVoted = await Vote.findOne({
      votingUserId: userId,
      postId: postId,
    });
    if (isAlreadyVoted && isAlreadyVoted.voteType === false) {
      //delete
      await Vote.findOneAndDelete({
        votingUserId: userId,
        postId: postId,
      });
      return res
        .status(200)
        .json({ status: 400, message: "vote removed" });
    }
    if (isAlreadyVoted && isAlreadyVoted.voteType === true) {
      isAlreadyVoted.voteType = false;
      await isAlreadyVoted.save();
      return res.status(200).json({ status: 200, message: "downvoted" });
    }
    const newVote = new Vote({
      votingUserId: userId,
      postId: postId,
      voteType: false,
    });

    await newVote.save();
    return res
      .status(201)
      .json({ status: 201, message: "downvoted", data: newVote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Votes
module.exports.voting = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.postId;
    const votingData = await Vote.find({ postId });

    if (votingData && votingData.length > 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Success", data: votingData });
    }
    return res
      .status(200)
      .json({ status: 404, message: "No voting data found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// bookmark

module.exports.addBookmark = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { _id } = req.params;
    const { type } = req.body;

    if (type !== "post" && type !== "comment") {
      return res
        .status(400)
        .json({ error: "Invalid type parameter. Must be 'post' or 'comment'" });
    }

    const filter =
      type === "post"
        ? { userId, postId: _id }
        : { userId, postCommentId: _id };
    const isBookmark = await Bookmark.findOne(filter);

    if (isBookmark) {
      // If the bookmark exists, remove it
      await Bookmark.deleteOne(filter);
      isBookmark.isBookmarked = false;
      return res
        .status(200)
        .json({ message: "Bookmark Removed", data: isBookmark });
    }

    // If the bookmark does not exist, add it
    const bookmark =
      type === "post"
        ? { userId, postId: _id }
        : { userId, postCommentId: _id };
    const bookmarkPost = new Bookmark(bookmark);
    await bookmarkPost.save();

    return res
      .status(201)
      .json({ status: 201, message: "Added to bookmark", data: bookmarkPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add bookmark
// module.exports.bookmarkPost = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const postId = req.params._id;
//     const isBookmark = await Bookmark.findOne({ userId: userId, postId: postId });

//     if (isBookmark) {
//       return res
//         .status(200)
//         .json({ status: 409, message: "Already in bookmark list" });
//     }
//     const bookmark = {
//       userId,
//       postId,
//     };

//     const bookmarkPost = new Bookmark(bookmark);
//     await bookmarkPost.save();

//     res.status(201);
//     res.json({ message: "Added to bookmark", data: bookmarkPost });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Get all bookmark
// module.exports.getAllBookmark = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const bookmarks = await Bookmark.find({ userId }).populate({
//       path: "postId",
//       populate: { path: "channelId" }
//     });

//     res.status(200);
//     res.json({ message: "Success", data: bookmarks });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports.getBookmarkPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postBookmarks = await Bookmark.find({
      userId,
      postId: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "postId",
        populate: {
          path: "channelId",
          model: "Channel",
        },
      });

    return res
      .status(200)
      .json({ status: 200, message: "Success", data: postBookmarks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports.getBookmarkComments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const commentBookmarks = await Bookmark.find({
      userId,
      postCommentId: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "postCommentId",
        populate: {
          path: "userId",
          model: "User",
        },
      });
    return res
      .status(200)
      .json({ status: 200, message: "Success", data: commentBookmarks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// get bookmarks
module.exports.getAllBookmark = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarks = await Bookmark.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "postId",
        model: "Post",
        populate: {
          path: "channelId",
          model: "Channel",
        },
      })
      .populate({
        path: "postCommentId",
        model: "PostComment",
        populate: [
          {
            path: "userId",
            model: "User",
          },
          {
            path: "postId",
            model: "Post",
            populate: {
              path: "channelId",
              model: "Channel",
            },
          },
        ],
      })
      .exec();

    const populatedBookmarks = await Promise.all(
      bookmarks.map(async (bookmark) => {
        if (!bookmark.postCommentId) {
          const populatedBookmark = await Bookmark.findById(bookmark._id)
            .populate({
              path: "postId",
              model: "Post",
              populate: {
                path: "channelId",
                model: "Channel",
              },
            })
            .populate({
              path: "postCommentId",
              model: "PostCommentReplies",
              populate: [
                {
                  path: "userId",
                  model: "User",
                },
                {
                  path: "postCommentId",
                  model: "PostComment",
                  populate: {
                    path: "postId",
                    model: "Post",
                    populate: {
                      path: "channelId",
                      model: "Channel",
                    },
                  },
                },
              ],
            })
            .exec();
          return populatedBookmark;
        }
        return bookmark;
      })
    );

    return res
      .status(200)
      .json({ status: 200, message: "Success", data: populatedBookmarks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove bookmark
// module.exports.removeBookmarkPost = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const postId  = req.params;
//     const isAlreadyBookmarked = await Bookmark.findOne({ userId: userId, postId: postId });

//     if (!isAlreadyBookmarked) {
//       return res.status(404).json({ message: "Not in bookmark list" });
//     }

//     await isAlreadyBookmarked.remove();
//     res.status(200).json({
//       status: 200,
//       message: "Removed from bookmark list",
//       data: isAlreadyBookmarked,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });
module.exports.removeBookmarkPost = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { _id } = req.params;
    const { type } = req.query;

    if (!type || !["post", "comment"].includes(type)) {
      return res.status(400).json({ message: "Invalid type provided" });
    }

    // Determine the field to search by based on the type
    const searchField = type === "post" ? "postId" : "postCommentId";

    const isAlreadyBookmarked = await Bookmark.findOne({
      userId,
      [searchField]: _id,
    });

    if (!isAlreadyBookmarked) {
      return res.status(404).json({ message: "Not in bookmark list" });
    }

    await isAlreadyBookmarked.remove();
    res.status(200).json({
      status: 200,
      message: "Removed from bookmark list",
      data: isAlreadyBookmarked,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add to favorite
module.exports.addToFavorite = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params._id;

    const isFavorite = await Favorite.findOne({ postId: postId });
    if (isFavorite) {
      return res.status(409).json({ message: "Already in favorite list" });
    }

    const favorite = {
      userId,
      postId,
    };

    const favoritePost = new Favorite(favorite);
    await favoritePost.save();

    res.status(201);
    res.json({ message: "Added to favorite", data: favoritePost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove favorite
module.exports.removeToFavorite = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;

    const isAlreadyFavorite = await Favorite.findOne({ postId: postId });

    if (!isAlreadyFavorite) {
      return res
        .status(404)
        .json({ message: "Not in favorite list", data: isAlreadyFavorite });
    }

    await isAlreadyFavorite.remove();
    res.status(200);
    res.json({ message: "Removed from favorite list" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Extract pdf
module.exports.extractPDFSlides = asyncHandler(async (req, res) => {
  try {
    const isFileExist = req.file;
    if (!isFileExist) {
      return res.status(400).json({
        success: false,
        message: "file not  received",
      });
    }

    const outputDir = path.join(__dirname, "../public/uploads/resumes");
    // pdfExtractor = new PdfExtractor(outputDir, {
    //   viewportScale: (width, height) => {
    //     //dynamic zoom based on rendering a page to a fixed page size
    //     if (width > height) {
    //       //landscape: 1100px wide
    //       return 1100 / width;
    //     }
    //     //portrait: 800px wide
    //     return 800 / width;
    //   },
    //   pageRange: [1, 5],
    // });
    // Parse the PDF and extract images

    // await pdfExtractor.parse(req.file?.path);
    // Get the list of image files
    const imageFiles = fs
      .readdirSync(outputDir)
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

    res.json({
      images: imageFiles.map(
        (file) => `http://localhost:5001/public/uploads/resumes/${file}`
      ),
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to extract images from PDF" });
  }
});

// Get pdf slides
module.exports.getAllPdfSlides = asyncHandler(async (req, res) => {
  const imageFiles = getAllImageFiles("public/uploads/resumes");
  const pdfImages = imageFiles.map((file) => {
    return `http://localhost:5001/public/uploads/resumes/${file}`;
  });

  res.json({ images: pdfImages });
});

// Post Comment
module.exports.postComment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params;
    const { excerpt, commentText } = req.body;

    const comment = {
      userId: userId,
      postId: postId,
      excerpt: excerpt,
      commentText: commentText,
    };

    const newComment = new PostComment(comment);
    await newComment.save();

    return res.status(201).json({
      status: 201,
      data: newComment,
      statusText: "New Comment Added!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Post Comment Replies
module.exports.postCommentReply = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postCommentId = req.params;
    const { commentReply } = req.body;

    const comment = {
      userId: userId,
      postCommentId: postCommentId,
      commentReply: commentReply,
    };

    const newComment = new PostCommentReply(comment);
    await newComment.save();

    return res.status(201).json({
      status: 201,
      data: newComment,
      statusText: "New Comment Replay Added!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Comments
module.exports.getAllComment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params;
    const comments = await PostComment.find({ postId: postId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: "User",
      });
    // Fetch votes for these comments
    const commentIds = comments.map((comment) => comment._id);
    const votes = await CommentVote.find({
      postCommentId: { $in: commentIds },
    });
    // Merge votes into comments
    const commentsWithVotes = comments.map((comment) => {
      const commentVotes = votes.filter((vote) =>
        vote.postCommentId.equals(comment._id)
      );
      const trueCount = commentVotes.filter(
        (vote) => vote.voteType === true
      ).length;
      const falseCount = commentVotes.filter(
        (vote) => vote.voteType === false
      ).length;

      return {
        ...comment.toObject(),
        trueCount: trueCount,
        falseCount: falseCount,
      };
    });

    const commentsWithBookmarkStatus = await Promise.all(
      commentsWithVotes.map(async (comment) => {
        const bookmark = await Bookmark.findOne({
          userId,
          postCommentId: comment._id,
        });
        return {
          ...comment,
          isBookmarked: !!bookmark,
        };
      })
    );
    const commentsWithReplyCount = await Promise.all(
      commentsWithBookmarkStatus.map(async (comment) => {
        const repliespercomment = await PostCommentReply.find({
          postCommentId: comment._id,
        });
        return {
          ...comment,
          replyCount: repliespercomment ? repliespercomment.length : 0,
        };
      })
    );
    return res.status(200).json({
      status: 200,
      message: "Success",
      data: commentsWithReplyCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all comments
module.exports.getAllCommentReplies = asyncHandler(async (req, res) => {
  const commentId = req.params._id;
  const userId = req.user._id;
  try {
    // Fetch the comment details with upvote and downvote counts
    const commentDetails = await PostComment.findById(commentId)
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: "User",
      })
      .lean();
    if (!commentDetails) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const votes = await CommentVote.find({ postCommentId: commentId }).lean();
    const upvoteCount = votes.filter((vote) => vote.voteType).length;
    const downvoteCount = votes.filter((vote) => !vote.voteType).length;

    // Fetch replies and their upvote/downvote counts
    const replies = await PostCommentReply.find({ postCommentId: commentId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: "User",
      })
      .lean();

    const replyIds = replies.map((reply) => reply._id);
    const replyVotes = await CommentVote.find({
      postCommentId: { $in: replyIds },
    }).lean();

    const repliesWithVotes = replies.map((reply) => {
      const replyUpvoteCount = replyVotes.filter(
        (vote) =>
          vote.postCommentId.toString() === reply._id.toString() &&
          vote.voteType
      ).length;
      const replyDownvoteCount = replyVotes.filter(
        (vote) =>
          vote.postCommentId.toString() === reply._id.toString() &&
          !vote.voteType
      ).length;
      return {
        ...reply,
        upvoteCount: replyUpvoteCount,
        downvoteCount: replyDownvoteCount,
      };
    });

    const repliesWithBookmarkStatus = await Promise.all(
      repliesWithVotes.map(async (reply) => {
        const bookmark = await Bookmark.findOne({
          userId,
          postCommentId: reply._id,
        });
        return {
          ...reply,
          isBookmarked: !!bookmark,
        };
      })
    );

    return res.status(200).json({
      comment: {
        ...commentDetails,
        upvoteCount,
        downvoteCount,
      },
      replies: repliesWithBookmarkStatus,
    });

    // return res.status(200).json({ data: replies });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Upvote comment
module.exports.upvoteComment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postCommentId = req.params._id;

    const isAlreadyVoted = await CommentVote.findOne({
      votingUserId: userId,
      postCommentId: postCommentId,
    });
    if (isAlreadyVoted && isAlreadyVoted.voteType === true) {
      await CommentVote.findOneAndDelete({
        votingUserId: userId,
        postCommentId: postCommentId,
      });
      return res.status(200).json({ status: 400, message: "vote removed" });
    }
    if (isAlreadyVoted && isAlreadyVoted.voteType === false) {
      isAlreadyVoted.voteType = true;
      await isAlreadyVoted.save();
      return res.status(200).json({ status: 200, message: "upvoted" });
    }
    const newVote = new CommentVote({
      votingUserId: userId,
      postCommentId: postCommentId,
      voteType: true,
    });

    await newVote.save();
    return res
      .status(200)
      .json({ status: 201, message: "upvoted", data: newVote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Downvote comment
module.exports.downvoteComment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const postCommentId = req.params._id;

    const isAlreadyVoted = await CommentVote.findOne({
      votingUserId: userId,
      postCommentId: postCommentId,
    });
    if (isAlreadyVoted && isAlreadyVoted.voteType === false) {
      await CommentVote.findOneAndDelete({
        votingUserId: userId,
        postCommentId: postCommentId,
      });
      return res
        .status(200)
        .json({ status: 400, message: "vote removed" });
    }
    if (isAlreadyVoted && isAlreadyVoted.voteType === true) {
      isAlreadyVoted.voteType = false;
      await isAlreadyVoted.save();
      return res.status(200).json({ status: 200, message: "downvoted" });
    }
    const newVote = new CommentVote({
      votingUserId: userId,
      postCommentId: postCommentId,
      voteType: false,
    });

    await newVote.save();
    return res
      .status(201)
      .json({ status: 201, message: "downvoted", data: newVote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Comment Votes
module.exports.commentVoting = asyncHandler(async (req, res) => {
  try {
    const postCommentId = req.params.postCommentId;
    const votingData = await CommentVote.find({ postCommentId });

    if (votingData && votingData.length > 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Success", data: votingData });
    }
    return res
      .status(200)
      .json({ status: 404, message: "No voting data found", data: [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Comment Reply
module.exports.commentReply = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params;
    const { commentReply } = req.body;

    const comment = {
      userId: userId,
      commentId: commentId,
      commentReply: commentReply,
    };

    const newComment = new CommentReply(comment);
    await newComment.save();

    return res.status(201).json({ status: 201, data: newComment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Comment Replies
module.exports.getCommentReplies = asyncHandler(async (req, res) => {
  const commentId = req.params._id;
  try {
    const replies = await CommentReply.find({ commentId }).populate("userId");

    return res.status(200).json({ data: replies });
  } catch (err) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.getCommentAndRepliesCount = asyncHandler(async (req, res) => {
  const postId = req.params._id;
  try {
    const comments = await PostComment.find({ postId: postId });
    let totalRepliesCount = 0;
    for (const comment of comments) {
      const repliesCount = await PostCommentReply.countDocuments({ postCommentId: comment._id });
      totalRepliesCount += repliesCount;
    }
    return res.status(200).json({ commentCount: comments.length, repliesCount: totalRepliesCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Unread post api
module.exports.unreadPost = asyncHandler(async (req, res) => {
  try {
    const { postId, userId, channelId, readPost } = req.body;

    const newUnreadPost = new UnreadPost({
      postId,
      userId,
      channelId,
      readPost,
    });

    const savedUnreadPost = await newUnreadPost.save();
    return res.status(201).json({ status: 201, data: savedUnreadPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all unread post
module.exports.getAllUnreadPost = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params._id;
    const userId = req.user._id;

    if (!channelId || !userId) {
      return res
        .status(200)
        .json({ status: 400, message: "channelId and userId are required" });
    }

    // const unreadPosts = await UnreadPost.find({ channelId, userId });
    const unreadPosts = await Post.find({ channelId, readBy: { $ne: userId } });

    if (!unreadPosts) {
      return res.status(200).json({ status: 404, data: null });
    }

    return res.status(200).json({ status: 200, data: unreadPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete the unread post
module.exports.deleteUnreadPost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params._id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(200)
        .json({ status: 404, message: "Unread post not found" });
    }

    const result = await post.readBy.id(userId).remove();
    await post.save();

    return res
      .status(200)
      .json({ status: 200, message: "Unread post deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Check post owner
module.exports.postOwner = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { _id } = req.params;
    const isOwner = await Post.findOne({ _id: _id, userId: userId });
    if (!isOwner) {
      return res.status(200).json({ status: 404, message: "Not an owner" });
    }
    return res.status(200).json({ status: 200, data: isOwner });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Post Comment
module.exports.deletePostComment = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params;
    console.log(req.params, "ids");
    const deletedPost = await PostComment.findOneAndDelete({ _id: _id });
    console.log(deletedPost, "deleted post comment --");
    return res.status(200).json({ status: 200, data: deletedPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Comment Reply
module.exports.deleteCommentReply = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params;
    const deletedReply = await PostCommentReply.findOneAndDelete({ _id: _id });
    console.log(deletedReply, "deleted comment reply--");
    return res.status(200).json({ status: 200, data: deletedReply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const addRecentlyViewedPost = async (userId, postId) => {
  let recentlyViewed = await RecentlyViewedPosts.findOne({ user: userId });

  if (!recentlyViewed) {
    recentlyViewed = new RecentlyViewedPosts({ user: userId, posts: [] });
  }
  recentlyViewed.posts = recentlyViewed.posts.filter(
    (id) => id.toString() !== postId.toString()
  );
  recentlyViewed.posts.unshift(postId);

  if (recentlyViewed.posts.length > 10) {
    recentlyViewed.posts.pop();
  }

  await recentlyViewed.save();
};
module.exports.getRecentlyViewedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const recentlyViewed = await RecentlyViewedPosts.findOne({
      user: userId,
    }).populate({
      path: "posts",
      populate: {
        path: "channelId",
        model: "Channel",
      },
    });
    if (!recentlyViewed) {
      return res.status(200).json({ status: 200, data: [] });
    }
    const postsWithBookmarkStatus = await Promise.all(
      recentlyViewed.posts.map(async (post) => {
        const bookmark = await Bookmark.findOne({ userId, postId: post._id });
        return {
          ...post.toObject(),
          isBookmarked: !!bookmark,
        };
      })
    );
    return res.status(200).json({ status: 200, data: postsWithBookmarkStatus });
  } catch (error) {
    console.error("Error fetching recently viewed posts:", error);
    throw new Error("Unable to fetch recently viewed posts");
  }
};
