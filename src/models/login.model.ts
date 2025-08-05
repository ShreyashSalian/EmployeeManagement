import mongoose, { Schema, Types, Document } from "mongoose";

interface LoginDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  email: string;
  accessToken: string;
  refreshToken: string;
}

const loginSchema = new Schema<LoginDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Login = mongoose.model<LoginDocument>("Login", loginSchema);
