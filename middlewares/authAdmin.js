import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  await jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ success: "failed", message: "Invalid Token" });
    }

    req.user = user;
    if (req.user.data !== "sachinvenyss@gmail.com") {
      return res
        .status(401)
        .json({ success: "failed", message: "not authenticated" });
    }
    console.log("Admin Authentication Success");
    next();
  });
};

export default authAdmin;
