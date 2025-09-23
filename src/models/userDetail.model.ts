import mongoose, { Types, Document, Schema } from "mongoose";

interface UserDetailDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  profileImage: string;
  proofPhoto: string[];
  designation: string;
  salary: number;
  joiningDate: Date;
  department: Types.ObjectId;
  totalRating: number;
  averageRating: number;
  updatedAt: Date;
  createdAt: Date;
}

const userDetailSchema = new Schema<UserDetailDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    profileImage: {
      type: String,
      // required: true,
    },
    proofPhoto: [
      {
        type: String,
      },
    ],
    designation: {
      type: String,
    },
    joiningDate: {
      type: Date,
    },
    salary: {
      type: Number,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const UserDetail = mongoose.model<UserDetailDocument>(
  "UserDetail",
  userDetailSchema
);
