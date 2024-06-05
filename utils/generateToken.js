import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = async (res,email) => {
  const token = await jwt.sign({ data: email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  await res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  });
  return token;
};

export default generateToken;
