import exprss from "express";
import dotenv from "dotenv";
import app from "./app.js";
import connectDataBase from "./config/connectDb.js";
dotenv.config();
const PORT = process.env.PORT || 4000;

connectDataBase();

const server = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

server();
