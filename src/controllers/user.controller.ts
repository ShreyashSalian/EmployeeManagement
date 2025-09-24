import express from "express";
import {
  allowedFieldsByRoleForEmployee,
  asycHandler,
  CustomRequestWithFile,
  CustomRequestWithFiles,
  filterFieldData,
  generateEmailVerificationToken,
  sendError,
  sendSuccess,
} from "../utils/function";

import path from "path";
import fs from "fs";
import crypto from "crypto";
import { CONSTANT_LIST } from "../constants/global-constants";
import { User } from "../models/user.model";
import { verifyUser } from "../middlewares/auth.middleware";
import { verifyEmail } from "../utils/sendMail";
import { UserBody } from "../helpers/user.helper";
import mongoose from "mongoose";
import { UserDetail } from "../models/userDetail.model";

interface CustomRequest extends express.Request {
  files?: {
    profileImage?: Express.Multer.File[];
    proofPhoto?: Express.Multer.File[];
  };
}
export const getLoginUserDetail = asycHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.user?.userId;
      console.log(userId);
      if (!userId) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "No user found"
        );
      }

      const userDetail = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "userdetails", // collection name of UserDetail
            localField: "_id",
            foreignField: "userId",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true, // in case userDetails is missing
          },
        },
        {
          $project: {
            password: 0,
            refreshToken: 0,
            resetPasswordToken: 0,
            resetPasswordTokenExpiry: 0,
            emailVerificationToken: 0,
          },
        },
      ]);

      if (!userDetail || userDetail.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, no user found"
        );
      }

      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Login user detail",
        userDetail[0] // send single object instead of array
      );
    } catch (err: any) {
      console.error(err);
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

      const userAlreadyExist = await User.findOne({
        $or: [
          {
            email: email,
          },
          {
            userName: userName,
          },
        ],
      });
      if (userAlreadyExist) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the user already created with given email or userName."
        );
      }

      // ✅ Accessing profileImage and proofPhoto correctly
      const profileImage = customReq.files?.profileImage?.[0]?.filename || "";

      console.log(customReq?.files?.profileImage);

      const proofImagesList =
        customReq.files?.proofPhoto?.map((file) => file.filename) || [];
      console.log(proofImagesList);
      // return;

      const emailVerificationToken: string = generateEmailVerificationToken();
      await verifyEmail(email, emailVerificationToken);
      const userCreation = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        role,
        contactNumber,
        emailVerificationToken: emailVerificationToken,
      });

      const userDetail = await UserDetail.create({
        userId: userCreation?._id,
        profileImage, // singular
        proofPhoto: proofImagesList,
        designation,
        salary,
        joiningDate,
        department,
      });

      const userCreated = await User.findById(userCreation?._id).select(
        "-password -emailVerificationToken"
      );

      return sendSuccess(res, 1, 201, "User created successfully", userCreated);
    } catch (err: any) {
      console.error(err);
      return sendError(res, 0, 500, "Internal server error.");
    }
  }
);

export const deleteMultipleProofImages = asycHandler(
  async (
    req: express.Request<{}, {}, { userId: string; proofPhoto: string[] }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const userId = req.body.userId;
      const proofPhoto = req.body.proofPhoto;
      if (!Array.isArray(proofPhoto) || proofPhoto.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the image that you want to delete."
        );
      }
      const user = await UserDetail.findOne({ userId: userId });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, no user found."
        );
      }
      const proofPhotoList = proofPhoto.filter((image) => {
        user?.proofPhoto.includes(image);
      });

      if (proofPhotoList.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "No images are there to delete."
        );
      }
      const deleteProofImages = proofPhotoList.map(async (image) => {
        const filePath = path.resolve(__dirname, "../../public/images", image);
        try {
          fs.unlink(filePath, (err: any) => {
            console.log(err);
          });
        } catch (err: any) {
          console.log(`Failed to delete the image`);
        }
      });
      await Promise.all(deleteProofImages);
      user.proofPhoto = user.proofPhoto.filter(
        (image) => !proofPhotoList.includes(image)
      );
      await user.save({ validateBeforeSave: false });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The image has been deleted successfully.",
        null
      );
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

export const updateTheUserDetail = asycHandler(
  async (
    req: express.Request<{}, {}, UserBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      type Role = keyof typeof allowedFieldsByRoleForEmployee;
      const role = userDetail?.role as Role;
      if (!userDetail || !(role in allowedFieldsByRoleForEmployee)) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid role."
        );
      }
      const allowedFields = allowedFieldsByRoleForEmployee[role];
      const updateData = filterFieldData(req.body, allowedFields);
      let userId: string | mongoose.Types.ObjectId =
        new mongoose.Types.ObjectId(userDetail?._id); //For admin

      if (role === "admin") {
        // userId = req.body.userId; //For admin
        if (req.body.userId === null) {
          userId = userDetail?._id;
        } else {
          userId = req.body.userId;
        }
      }
      const userUpdate = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password -emailVerificationToken");
      if (userUpdate) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The user detail has been updated successfully,",
          userUpdate
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the user detail can not be updated."
        );
      }

      // const userDetail = await User.findById(user);
      // if (!userDetail) {
      //   return sendError(
      //     res,
      //     CONSTANT_LIST.STATUS_ERROR,
      //     CONSTANT_LIST.BAD_REQUEST,
      //     "No user found"
      //   );
      // }
      // let userId: string | mongoose.Types.ObjectId =
      //   new mongoose.Types.ObjectId(userDetail?._id);

      // if (userDetail?.role === "admin") {
      //   userId = user;
      // }
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
