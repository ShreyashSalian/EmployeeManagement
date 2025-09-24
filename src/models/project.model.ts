import mongoose, { Types, Document, Schema } from "mongoose";

interface ProjectDocument extends Document {
  _id: string;
  title: string;
  projectCode: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  teamMember: Types.ObjectId[];
  department: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PROJECTENUM {
  PENDING = "pending",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  MISSED = "missed",
}

const projectSchema = new Schema<ProjectDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    projectCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(PROJECTENUM),
      default: PROJECTENUM.PENDING,
    },
    teamMember: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<ProjectDocument>(
  "Project",
  projectSchema
);
