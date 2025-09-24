import express from "express";
import userRouter from "./user.route";
import authRouter from "./auth.route";
import departmentRouter from "./department.route";
import projectRouter from "./project.route";

const indexRouter = express.Router();
indexRouter.use("/api/v1/users", userRouter);
indexRouter.use("/api/v1/auth", authRouter);
indexRouter.use("/api/v1/departments", departmentRouter);
indexRouter.use("/api/v1/projects", projectRouter);
indexRouter.get("/api/v1", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "The server is running properly!!!!!" });
});

export default indexRouter;
