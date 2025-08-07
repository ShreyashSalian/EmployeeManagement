import mongoose, { Types } from "mongoose";
export interface ProjectBody {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  teamMember: Types.ObjectId[];
  department: Types.ObjectId;
}
