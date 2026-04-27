import { Router } from "express";
import * as Serives from "./Services/notes.services.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";

const noteController = Router();

// Create a new note
noteController.post("", authenticationMiddleware, Serives.CreateNoteService);

// Update title of all user notes
noteController.patch(
  "/all",
  authenticationMiddleware,
  Serives.UpdateTitleOfAllUserNotesService
);

// Update a specific note
noteController.patch(
  "/:noteId",
  authenticationMiddleware,
  Serives.UpdateService
);

// Replace a specific note
noteController.put(
  "/replace/:noteId",
  authenticationMiddleware,
  Serives.ReplaceService
);

// Delete a specific note
noteController.delete(
  "/:noteId",
  authenticationMiddleware,
  Serives.DeleteSingleNoteService
);

// Get paginated and sorted notes
noteController.get(
  "/paginate-sort",
  authenticationMiddleware,
  Serives.GetPaginatedSortedNotesService
);

// Get note by content
noteController.get(
  "/note-by-content",
  authenticationMiddleware,
  Serives.GetNoteByContentService
);

// Get All Notes With User Info (email)
noteController.get(
  "/note-with-user",
  authenticationMiddleware,
  Serives.GetNotesWithUserInfoService
);

// Aggregate: search by title + user info
noteController.get(
  "/aggregate",
  authenticationMiddleware,
  Serives.GetNotesWithAggregationService
);

// Delete
noteController.delete(
  "",
  authenticationMiddleware,
  Serives.deleteAllNotesForLoggedInUser
);

// MUST BE LAST: Get a note by its ID
noteController.get(
  "/:noteId",
  authenticationMiddleware,
  Serives.GetNoteByIdService
);

export default noteController;
