import mongoose from "mongoose";
import User from "../DB/Models/users.model.js";
import { verifyToken } from "../Utils/tokens.utils.js";

export const authenticationMiddleware = async (req, res, next) => {
  const { accesstoken } = req.headers;
  if (!accesstoken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Verify Token
  const decotedData = verifyToken(accesstoken, process.env.JWT_SECRET);
  if (!decotedData.jti) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }

  // Validate ObjectId Format
  if (!mongoose.Types.ObjectId.isValid(decotedData.id)) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  // Get User Date From DB
  const user = await User.findById(decotedData?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User Not Found" });
  }

  req.loggedInUser = user;

  next();
};
