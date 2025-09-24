import express from "express";
import { checkAdmin, verifyUser } from "../middlewares/auth.middleware";
import { departmentValidation } from "../validation/department.validation";
import {
  addNewDepartment,
  deleteDepartment,
  getDepartmentById,
  listAllDepartment,
  softDeleteDepartment,
  updateDepartment,
} from "../controllers/department.controller";
import { validationApi } from "../middlewares/validation.middleware";

const departmentRouter = express.Router();

departmentRouter.post(
  "/",
  verifyUser,
  checkAdmin,
  departmentValidation(),
  validationApi,
  addNewDepartment
);

departmentRouter.post("/search", verifyUser, checkAdmin, listAllDepartment);

departmentRouter.put(
  "/:departmentId",
  verifyUser,
  checkAdmin,
  departmentValidation(),
  validationApi,
  updateDepartment
);

departmentRouter.post(
  "/:departmentId",
  verifyUser,
  checkAdmin,
  softDeleteDepartment
);
departmentRouter.delete(
  "/:departmentId",
  verifyUser,
  checkAdmin,
  deleteDepartment
);
departmentRouter.get(
  "/:departmentId",
  verifyUser,
  checkAdmin,
  getDepartmentById
);

export default departmentRouter;
