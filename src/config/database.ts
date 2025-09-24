import mongoose from "mongoose";
import { addAdminFromList } from "../utils/addAdmin";
import { projectStatusJob } from "../utils/projectStatus.job";

export const connectDB = async (): Promise<void> => {
  try {
    const DB =
      process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_PATH}/${process.env.DATABASE}`
        : `${process.env.LIVE_PATH}/${process.env.DATABASE}`;
    const connection = await mongoose.connect(DB);
    addAdminFromList();
    projectStatusJob();
    console.log(`The database is connected to : ${connection.connection.host}`);
  } catch (err: any) {
    console.log(`Error while connecting to the Database: ${err}`);
    process.exit(1);
  }
};
