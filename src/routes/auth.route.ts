import express from "express";
import { loginValidation } from "../validation/login.validation";
import { validationApi } from "../middlewares/validation.middleware";
import { verifyUser } from "../middlewares/auth.middleware";
import { LoginUser, logout } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/login", loginValidation(), validationApi, LoginUser);

authRouter.get("/logout", verifyUser, logout);

export default authRouter;
