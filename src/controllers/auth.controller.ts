import express from "express";
import { User } from "../models/user.model";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";

import { CONSTANT_LIST } from "../constants/global-constants";
import { Login } from "../models/login.model";
import {
  asycHandler,
  generateEmailVerificationToken,
  sendError,
  sendSuccess,
} from "../utils/function";
import {
  ChangePasswordBody,
  LoginBody,
  UserBody,
} from "../helpers/user.helper";
import { forgotPasswordMail } from "../utils/sendMail";

const generateAccessAndRefreshToken = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("No user found.");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    return {
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const LoginUser = asycHandler(
  async (
    req: express.Request<{}, {}, LoginBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { userNameOrEmail, password } = req.body;
      const userDetail = await User.findOne({
        $or: [
          {
            email: { $regex: userNameOrEmail, $options: "i" },
          },
          {
            userName: userNameOrEmail,
          },
        ],
      });
      if (!userDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_USER_FOUND,
          "Sorry, no user found with the given email or userName"
        );
      }
      if (userDetail?.isDeleted) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, your account has been deleted by admin"
        );
      }
      const passwordCheck = await userDetail?.comparePassword(password);
      if (!passwordCheck) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the valid password"
        );
      }

      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        userDetail?._id
      );

      await Login.create({
        userId: userDetail?._id,
        email: userDetail?.email,
        accessToken,
        refreshToken,
      });

      const loginUser = await User.findById(userDetail?._id).select(
        "-password"
      );
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Login user details",
        {
          loginUser,
          accessToken,
          refreshToken,
        }
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

export const logout = asycHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
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

      const token: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer ", "")
        .trim();

      const deleteUserFromLogin = await Login.findOneAndDelete({
        userId: user,
        accessToken: token,
      });
      if (deleteUserFromLogin) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "User has been logout successfully",
          {}
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry the user can not be logout"
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

export const generateAccessTokenForLogin = asycHandler(
  async (
    req: express.Request<{}, {}, { incomingRefreshToken: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const incomingRefreshToken = req.body.incomingRefreshToken;
      if (!incomingRefreshToken) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the refresh token"
        );
      }
      const secretKey =
        process.env.ACCESS_TOKEN ||
        "7ea890302bf4c8dda9de988ac1d989f9de8b381d72d0d94c92837c17280c25fe0e1854016b982b07";
      if (!secretKey) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the refresh token"
        );
      }
      const verifyRefreshToken = jwt.verify(
        incomingRefreshToken,
        secretKey
      ) as JwtPayload;
      if (!verifyRefreshToken) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Unauthorised user."
        );
      }
      const user = await User.findById(verifyRefreshToken?._id).select(
        "-password"
      );
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the refresh token"
        );
      }
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user?._id
      );
      const responsePayload = {
        user,
        accessToken,
        refreshToken,
      };

      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The access Token",
        responsePayload
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

export const changePassword = asycHandler(
  async (
    req: express.Request<{}, {}, ChangePasswordBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "User not found."
        );
      }
      const passwordCheck: boolean = await user.comparePassword(oldPassword);
      if (!passwordCheck) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the valid password."
        );
      }
      user.password = newPassword;
      await user.save({ validateBeforeSave: false });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Password updated successfully.",
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

export const forgotPassword = asycHandler(
  async (
    req: express.Request<{}, {}, UserBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const email = req.body.email;
      const user = await User.findOne({
        email: email,
      });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry,  no user found with given email"
        );
      }
      const token = generateEmailVerificationToken();
      const date = Date.now() + 3600000;
      await User.findByIdAndUpdate(user?._id, {
        $set: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: date,
        },
      });
      await forgotPasswordMail(token, user?.email);
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Reset passweord mail has been send successfully",
        null
      );
    } catch (err: any) {
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const resetPassword = asycHandler(
  async (
    req: express.Request<{}, {}, { token: string; password: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "The token has been expired."
        );
      }
      user.password = password;
      user.resetPasswordToken = "";
      user.resetPasswordTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The user has updated the password successfully.",
        null
      );
    } catch (err: any) {
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const userEmailVerification = asycHandler(
  async (
    req: express.Request<{}, {}, { token: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const token = req.body.token;
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please enter the valid token"
        );
      }
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save({ validateBeforeSave: false });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Email verified successfully.",
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
