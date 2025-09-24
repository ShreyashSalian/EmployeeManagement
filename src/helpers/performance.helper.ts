import mongoose, { Types } from "mongoose";
export interface PerformanceBody {
  employee: Types.ObjectId;
  projectId: Types.ObjectId;
  reviewDate: Date;
  rating: Number;
  comments: string;
  goalsAchieved: string;
  goalsPending: string;
}
