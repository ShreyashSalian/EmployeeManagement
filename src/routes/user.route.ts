import express from "express";

import { validationApi } from "../middlewares/validation.middleware";
import { addNewUser, getLoginUserDetail } from "../controllers/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { userValidation } from "../validation/user.validation";
import { forgotPasswordValidation } from "../validation/forgotPassword.validation";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  userEmailVerification,
} from "../controllers/auth.controller";
import { resetPasswordValidation } from "../validation/resetPassword.validation";
import { changePasswordValidation } from "../validation/changePassword.validation";
import { emailVerficationValidation } from "../validation/emailVerification.validation";
const userRouter = express.Router();

userRouter.post(
  "/",
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "proofPhoto",
      maxCount: 5,
    },
  ]),
  userValidation(),
  validationApi,
  addNewUser
);

userRouter.get("/", verifyUser, getLoginUserDetail);
userRouter.post(
  "/forgot-password",
  forgotPasswordValidation(),
  validationApi,
  forgotPassword
);

userRouter.post(
  "/reset-password",
  resetPasswordValidation(),
  validationApi,
  resetPassword
);
userRouter.post(
  "/change-password",
  changePasswordValidation(),
  validationApi,
  changePassword
);
userRouter.post(
  "/verify-email",
  emailVerficationValidation(),
  validationApi,
  userEmailVerification
);
export default userRouter;
