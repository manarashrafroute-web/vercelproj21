import jwt from "jsonwebtoken";
// Generate Token
export const generateToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};

// Verify Token
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
