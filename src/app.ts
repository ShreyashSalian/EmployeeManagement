import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import dotnev from "dotenv";
dotnev.config();
const app = express();

app.use(
  cors({
    credentials: true,
    methods: "POST,DELETE,GET,PUT,PATCH,HEAD",
    origin: process.env.ORIGIN,
  })
);

app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static("public/images"));

export default app;
