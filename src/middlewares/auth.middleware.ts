import express from "express";
import { asycHandler, sendError } from "../utils/function";
import { Login } from "../models/login.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { CONSTANT_LIST } from "../constants/global-constants";

export const verifyUser = asycHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const token: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer", "")
        .trim();
      if (!token) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
        );
      }
      const secretKey: string | undefined = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
        );
      }
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
      console.log(decodedToken);
      const userDetail = await Login.findOne({
        userId: decodedToken?.userId,
        email: decodedToken?.email,
        accessToken: token,
      });
      if (!userDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
        );
      } else {
        req.user = userDetail;
        next();
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

export const checkAdmin = asycHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const user = req.user?.userId;
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized request"
        );
      }
      const userFound = await User.findById(user);
      if (!userFound) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized request"
        );
      }
      if (userFound?.role === "admin") {
        return next();
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized request"
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

const verifyUserTwo = asycHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const token: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer", "")
        .trim();
      if (!token) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
        );
      }
      const secretKey: string | undefined = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
        );
      }
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
      console.log(decodedToken);
      const userDetails = await Login.findOne({
        userId: decodedToken?.userId,
        email: decodedToken?.email,
        accessToken: token,
      });
      if (userDetails) {
        req.user = userDetails;
        next();
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "UnAuthorized request"
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

export const checkAdminTwo = asycHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      if (!userDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized request"
        );
      }
      if (userDetail?.role === "admin") {
        return next();
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized request"
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
