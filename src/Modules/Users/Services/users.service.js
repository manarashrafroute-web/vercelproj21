import { compareSync, hashSync } from "bcrypt";
import User from "./../../../DB/Models/users.model.js";
import { encrypt } from "./../../../Utils/encryption.utils.js";
import { generateToken } from "../../../Utils/tokens.utils.js";
import { v4 as uuidv4 } from "uuid";

export const SignupService = async (req, res) => {
  const { name, email, password, phone, age } = req.body;

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return res
      .status(400)
      .json({ success: false, message: "Email Is Already Exist" });
  }

  // Hashing Password
  const hashedPassword = hashSync(password, +process.env.HASHING_SALT);

  // Encrypt Phone Number
  const encryptedPhone = encrypt(phone);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    age,
  });

  return res
    .status(200)
    .json({ success: true, message: "User Created Successfully" });
};

export const LoginService = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email Is Required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password Is Required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "Wrong Email Or Password" });
  }

  const isPasswordMatch = compareSync(password, user.password);
  if (!isPasswordMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Wrong Email Or Password" });
  }

  // Generate Token
  const accessToken = generateToken(
    {
      id: user._id,
      email: user.email,
      jti: uuidv4(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );

  return res.status(200).json({
    success: true,
    message: "User Logged Successfully",
    accessToken,
    user: {
      name: user.name,
      email: user.email,
      age: user.age,
    },
  });
};

export const UpdateService = async (req, res) => {
  const { id } = req.loggedInUser;
  const { name, email, phone, age } = req.body;

  const updatedUser = {};
  if (name) updatedUser.name = name;
  if (phone) updatedUser.phone = encrypt(phone);
  if (age) updatedUser.age = age;

  // Email Checks
  if (email) {
    const isEmailExist = await User.findOne({
      email,
      _id: { $ne: id },
    });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ success: false, message: "Email Is Already Exist" });
    }
    updatedUser.email = email;
  }

  const user = await User.findByIdAndUpdate(id, updatedUser, {
    new: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "User Not Found" });
  }

  return res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    user: {
      name: user.name,
      email: user.email,
      age: user.age,
    },
  });
};

export const DeleteService = async (req, res) => {
  const { id } = req.loggedInUser;

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return res
      .status(404)
      .json({ success: false, message: "User Not Found Or Already Deleted" });
  }

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
    user: {
      id: deletedUser.id,
      email: deletedUser.email,
      name: deletedUser.name,
    },
  });
};

export const GetUserDataService = async (req, res) => {
  const { id } = req.loggedInUser;

  const user = await User.findById(id).select("-password -__v");
  if (!user) {
    return res.status(404).json({ success: false, message: "User Not Found" });
  }

  return res.status(200).json({ success: true, user });
};
