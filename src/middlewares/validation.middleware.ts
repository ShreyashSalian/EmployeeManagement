import { validationResult } from "express-validator";
import express from "express";
export const validationApi = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void | Promise<void> => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: { [key: string]: string } = {};
  errors
    .array({ onlyFirstError: true })
    .map((err: any) => (extractedErrors[err.path] = err.msg));

  const responsePayload = {
    status: 0,
    statusCode: 417,
    data: null,
    successMessage: null,
    errorsMessage: extractedErrors,
  };

  res.status(417).json(responsePayload);
  return;
};
