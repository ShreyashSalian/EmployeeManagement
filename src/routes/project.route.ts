import express from "express";
import { checkAdmin, verifyUser } from "../middlewares/auth.middleware";
import { projectValidation } from "../validation/project.validation";
import { validationApi } from "../middlewares/validation.middleware";
import {
  addNewProject,
  deleteProject,
  getProjectById,
  listAllProject,
  updateProject,
} from "../controllers/project.controller";
import { softDeleteDepartment } from "../controllers/department.controller";

const projectRouter = express.Router();

projectRouter.post(
  "/",
  verifyUser,
  checkAdmin,
  projectValidation(),
  validationApi,
  addNewProject
);
projectRouter.post("/search", verifyUser, checkAdmin, listAllProject);

projectRouter.put(
  "/:projectId",
  verifyUser,
  checkAdmin,
  projectValidation(),
  validationApi,
  updateProject
);

projectRouter.post("/:projectId", verifyUser, checkAdmin, softDeleteDepartment);
projectRouter.delete("/:projectId", verifyUser, checkAdmin, deleteProject);
projectRouter.get("/:projectId", verifyUser, checkAdmin, getProjectById);

export default projectRouter;
