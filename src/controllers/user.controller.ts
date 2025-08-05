import express from "express";
import {
  asycHandler,
  CustomRequestWithFile,
  CustomRequestWithFiles,
  generateEmailVerificationToken,
  sendError,
  sendSuccess,
} from "../utils/function";

import crypto from "crypto";
import { CONSTANT_LIST } from "../constants/global-constants";
import { User } from "../models/user.model";
import { verifyUser } from "../middlewares/auth.middleware";
import { verifyEmail } from "../utils/sendMail";

interface CustomRequest extends express.Request {
  files?: {
    profileImage?: Express.Multer.File[];
    proofPhoto?: Express.Multer.File[];
  };
}
export const getLoginUserDetail = asycHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user?.userId;
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "No user found"
        );
      }
      const userDetail = await User.findById(user).select("-password");
      if (userDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "Login user detail",
          userDetail
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, no user found"
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const addNewUser = asycHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const customReq = req as CustomRequest;

      const {
        firstName,
        lastName,
        userName,
        email,
        password,
        role,
        designation,
        salary,
        joiningDate,
        contactNumber,
        department,
      } = customReq.body;

      // ✅ Accessing profileImage and proofPhoto correctly
      const profileImage = customReq.files?.profileImage?.[0]?.filename || "";

      const proofImages =
        customReq.files?.proofPhoto?.map((file) => file.filename) || [];

      const emailVerificationToken: string = generateEmailVerificationToken();
      await verifyEmail(email, emailVerificationToken);
      const userCreation = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        profileImage, // singular
        proofImages, // array
        role,
        designation,
        salary,
        joiningDate,
        contactNumber,
        department,
        emailVerificationToken: emailVerificationToken,
      });

      const userCreated = await User.findById(userCreation?._id).select(
        "password"
      );

      return sendSuccess(res, 1, 201, "User created successfully", userCreated);
    } catch (err: any) {
      console.error(err);
      return sendError(res, 0, 500, "Internal server error.");
    }
  }
);
