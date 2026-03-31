const express = require("express");
const router = express.Router();
const notesModel = require("../schemas/notes.model");

const middleware = require("../middleware/userverifecation");
const upload = require('../middleware/multer')
router.post("/addnotes", middleware, upload.single('image'), async (req, res) => {
try {
  const { title, description, tag } = req.body;
  // console.log(title, description, tag, req.user);
  // console.log(req.file)
  let user;
  if(req.file){
    user = await notesModel.create({
      title: title,
      description: description,
      tag: tag,
      image:req.file.filename,
      createdby: req.user,
    });
  }
  else{
    user = await notesModel.create({
      title: title,
      description: description,
      tag: tag,
      createdby: req.user,
    });
  }

  res.status(200).json({
    success: true,
    message: "Note Added Successfully",
    usernotes: user,
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:error
  })
}
 
});


// router.post("/addnotes", middleware, async (req, res) => {
//   try {
//     const { title, description, tag } = req.body;
//     console.log(req.body, req.user);
//     let user = await notesModel.create({
//       title: title,
//       description: description,
//       tag: tag,
//       createdby: req.user,
//     });
//     res.status(200).json({
//       success: true,
//       message: "Note Added Successfully",
//       usernotes: user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error,
//     });
//   }
// });

router.get("/getnotes", middleware, async (req, res) => {
  console.log(req.user);
  try {
    let allNotes = await notesModel.find({ createdby: req.user });
    res.status(200).json({
      success: true,
      message: "Your notes",
      notes: allNotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
});

router.put("/updatenotes/:id", middleware, async (req, res) => {
  let { title, description, tag } = req.body;
  let newNotes = {};
  if (title) {
    newNotes.title = title;
  }
  if (description) {
    newNotes.description = description;
  }
  if (tag) {
    newNotes.tag = tag;
  }

  try {
    // Find the note to be updated
    let notes = await notesModel.findById(req.params.id);
    if (!notes) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    // Allow update only if the user owns this note
    if (notes.createdby.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not Allowed" });
    }

    notes = await notesModel.findByIdAndUpdate(
      req.params.id,
      { $set: newNotes },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Notes Updated Successfully",
      notes: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
});

router.delete("/deletenotes/:id", middleware, async (req, res) => {
  try {
    // Find the note to be deleted
    let notes = await notesModel.findById(req.params.id);
    if (!notes) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    // Allow deletion only if the user owns this note
    if (notes.createdby.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not Allowed" });
    }

    let deleteNotes = await notesModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Notes Deleted Successfully",
      deleteNotes: deleteNotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
});

module.exports = router;
