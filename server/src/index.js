import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
