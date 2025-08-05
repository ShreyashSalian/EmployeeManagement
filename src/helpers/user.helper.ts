import mongoose, { Types } from "mongoose";
export interface LoginBody {
  userNameOrEmail: string;
  password: string;
}

export interface UserBody {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  contactNumber: string;
  department: Types.ObjectId;
}

export interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}
