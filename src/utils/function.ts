import { AnyARecord } from "dns";
import express from "express";
import crypto from "crypto";

export function asycHandler<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction
  ) => Promise<any>
) {
  return (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction
  ) => Promise.resolve(fn(req, res, next)).catch(next);
}

export const sendSuccess = (
  res: express.Response,
  status: number,
  statusCode: number,
  successMessage: string,
  data: any
) => {
  return res.status(statusCode).json({
    status,
    statusCode,
    successMessage,
    errorMessage: null,
    data,
  });
};

export const sendError = (
  res: express.Response,
  status: number,
  statusCode: number,
  errorMessage: string
) => {
  return res.status(statusCode).json({
    status,
    statusCode,
    successMessage: null,
    errorMessage,
    data: null,
  });
};

export const trimInput = (value: string) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};
export const convertToUpperCase = (name: string) => {
  const word = name.split(" ");
  for (let i = 0; i <= word.length; i++) {
    word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
  }
  return word.join(" ");
};

export interface CustomRequestWithFile extends express.Request {
  file: Express.Multer.File;
}

export interface CustomRequestWithFiles extends express.Request {
  files: Express.Multer.File[];
}

export const allowedFieldsByRole = {
  admin: ["title", "description", "priority", "status", "duedate"],
  user: ["title", "description"],
};

export const filterFieldData = (data: any, allowedFields: string[]) => {
  let filteredData: any = {};
  for (let key of data) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
    return filteredData;
  }
};

export const generateEmailVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
