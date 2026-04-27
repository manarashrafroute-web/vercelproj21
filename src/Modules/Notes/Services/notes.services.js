import mongoose from "mongoose";
import Note from "./../../../DB/Models/notes.model.js";

export const CreateNoteService = async (req, res) => {
  const { id } = req.loggedInUser;
  const { title, content } = req.body;

  if (!title || !content) {
    
    return res
      .status(400)
      .json({ success: false, message: "Title And Content Are Required" });
  }

  const note = await Note.create({ title, content, userId: id });

  return res.status(201).json({
    success: true,
    message: "Note Created",
    note: {
      title,
      content,
      id: note._id,
    },
  });
};

export const UpdateService = async (req, res) => {
  const { id } = req.loggedInUser;
  const { noteId } = req.params;
  const { title, content } = req.body;

  // Vlidate On Note ID
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ success: false, message: "Invalid Note ID" });
  }

  // Get note By ID First
  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ success: false, message: "Note Not Found" });
  }
  // Check Ownership
  if (note.userId.toString() !== id) {
    return res
      .status(403)
      .json({ success: false, message: "You Are Not The Owner" });
  }

  // Check if any data to update
  if (!title && !content) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  // Apply Changes
  if (title) note.title = title;
  if (content) note.content = content;
  await note.save();

  return res.status(200).json({ success: true, message: "Note Updated", note });
};

export const ReplaceService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { noteId } = req.params;
  const { title, content } = req.body;

  // Validate On Note ID
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ message: "Invalid Note ID" });
  }

  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not Found" });
  }
  if (note.userId.toString() !== userId) {
    return res
      .status(403)
      .json({ success: false, message: "You Are Not The Owner" });
  }

  if (!title || !content) {
    return res
      .status(400)
      .json({ success: false, message: "Both title And Content Are Required" });
  }

  // Overwrite The Whole Document
  note.overwrite({ _id: noteId, title, content, userId });
  await note.save();

  return res
    .status(200)
    .json({ success: true, message: "Note Replaced", note });
};

export const UpdateTitleOfAllUserNotesService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { title } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title Is Required" });
  }

  const result = await Note.updateMany({ userId }, { $set: { title } });
  if (result.modifiedCount === 0) {
    return res.status(404).json({ success: false, message: "No Note Found" });
  }

  return res.status(200).json({ success: true, message: "All Notes Updated" });
};

export const DeleteSingleNoteService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { noteId } = req.params;

  // Validate On Note ID
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ success: false, message: "Invalid Note ID" });
  }

  // Note Validation And Ownership Validation
  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ success: false, message: "Note Not Found" });
  }
  if (note.userId.toString() !== userId) {
    return res
      .status(400)
      .json({ success: false, message: "You Are Not The Owner" });
  }

  // Deleting Note
  const deletedNote = await Note.findOneAndDelete(noteId);

  return res
    .status(200)
    .json({ success: true, message: "Note Deleted", deletedNote });
};

export const GetPaginatedSortedNotesService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { page, limit } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  if (!page || !limit) {
    return res
      .status(400)
      .json({ success: false, message: "Page And Limit Are Required" });
  }

  const notes = await Note.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .select("-__v");
  if (notes === null) {
    return res.status(404).json({ success: false, message: "Notes Not Found" });
  }

  return res.status(200).json({ success: true, notes });
};

export const GetNoteByIdService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { noteId } = req.params;

  // Validate On Note ID
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ success: false, message: "Invalid Note ID" });
  }

  const note = await Note.findById(noteId).select("-__v");
  if (!note) {
    return res.status(404).json({ success: false, message: "Note Not Found" });
  }
  if (note.userId.toString() !== userId) {
    return res
      .status(400)
      .json({ success: false, message: "You Are Not The Owner" });
  }

  return res.status(200).json({ success: true, note });
};

export const GetNoteByContentService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { content } = req.query;

  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: "Content Is Required" });
  }

  const note = await Note.findOne({ userId, content }).select("-__v");
  if (!note) {
    return res.status(404).json({ success: false, message: "Note Not Found" });
  }

  return res.status(200).json({ success: true, note });
};

export const GetNotesWithUserInfoService = async (req, res) => {
  const { id: userId } = req.loggedInUser;

  const notes = await Note.find({ userId })
    .select("title userId createdAt")
    .populate("userId", "email -_id");
  if (notes.length === 0) {
    return res.status(404).json({ success: false, message: "Notes Not Found" });
  }

  return res.status(200).json({ success: true, notes });
};

export const GetNotesWithAggregationService = async (req, res) => {
  const { id: userId } = req.loggedInUser;
  const { title } = req.query;

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(title && { title }),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        title: 1,
        createdAt: 1,
        "user.name": 1,
        "user.email": 1,
      },
    },
  ];

  const notes = await Note.aggregate(pipeline);
  return res.status(200).json({ success: true, notes });
};

export const deleteAllNotesForLoggedInUser = async (req, res) => {
  const { id: userId } = req.loggedInUser;

  const deletedNotes = await Note.deleteMany({ userId });
  if (deletedNotes.deletedCount === 0) {
    return res
      .status(404)
      .json({ success: false, message: "There Are No Notes To Delete" });
  }

  return res.status(200).json({
    success: true,
    message: "Notes Deleted Successfully",
    deletedCount: deletedNotes.deletedCount,
  });
};
