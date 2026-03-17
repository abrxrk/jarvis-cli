import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/api/auth/", toNodeHandler(auth)); 
app.use(express.json());

app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
