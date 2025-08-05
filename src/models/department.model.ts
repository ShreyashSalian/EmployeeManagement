import mongoose, { Types, Document, Schema } from "mongoose";
interface DepartmentDocument extends Document {
  _id: string;
  name: string;
  description: string;
  manager: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requried: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model<DepartmentDocument>(
  "Department",
  departmentSchema
);
