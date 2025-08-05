import mongoose, { Types } from "mongoose";
interface UserDetails {
  email: string;
  userId: Types.ObjectId;
  accessToken: string;
}

import * as express from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: UserDetails;
    }
  }
}
