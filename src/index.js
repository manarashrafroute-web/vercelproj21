import "dotenv/config";
import express from "express";
import dbConnection from "./DB/db.connection.js";
import userController from "./Modules/Users/users.controller.js";
import noteController from "./Modules/Notes/notes.controller.js";

const app = express();
dbConnection();
app.use(express.json());

app.use("/users", userController);
app.use("/notes", noteController);


// 404 Handling
app.get("/" , (req, res, next) => {
  res.status(201).send({ success: false, message: "Hello" });
});
// 404 Handling
app.use((req, res, next) => {
  res.status(404).send({ success: false, message: "404 Not Found" });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(process.env.PORT , ()=>{
  console.log(`server is runnigng 3000`);
  
});


export default app 