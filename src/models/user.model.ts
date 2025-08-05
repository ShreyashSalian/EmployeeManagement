import mongoose, { Types, Schema, Document, Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  profileImage: string;
  proofPhoto: string[];
  role: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  isDeleted: boolean;
  contactNumber: string;
  department: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  OWNER = "owner",
  EMPLOYEE = "employee",
  MODERATOR = "moderator",
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      // required: true,
    },
    salary: {
      type: Number,
    },
    joiningDate: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    proofPhoto: [
      {
        type: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  } else {
    try {
      user.password = await bcrypt.hash(user.password, 12);
    } catch (err: any) {
      throw new Error(err);
    }
  }
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as UserDocument;
  return await bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
    },
    token,
    {
      expiresIn: "1h",
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.REFRESH_TOKEN;
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
    },
    token,
    {
      expiresIn: "10d",
    }
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
