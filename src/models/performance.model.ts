import mongoose, { Types, Document, Schema } from "mongoose";

interface PerformanceDocument extends Document {
  _id: string;
  employee: Types.ObjectId;
  projectId: Types.ObjectId;
  reviewDate: Date;
  rating: number;
  reviewer: Types.ObjectId;
  comments: string;
  goalsAchieved: string;
  goalsPending: string;
  createdAt: Date;
  updatedAt: Date;
}

const performanceSchema = new Schema<PerformanceDocument>({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewDate: {
    type: Date,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  rating: {
    type: Number,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: {
    type: String,
  },
  goalsAchieved: {
    type: String,
  },
  goalsPending: {
    type: String,
  },
});

export const PerformaceModel = mongoose.model<PerformanceDocument>(
  "Performace",
  performanceSchema
);
