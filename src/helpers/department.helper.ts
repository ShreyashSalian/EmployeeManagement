import mongoose, { Types } from "mongoose";
export interface DepartmentBody {
  name: string;
  description: string;
  manager: Types.ObjectId;
}
