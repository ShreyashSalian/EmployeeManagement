import cron from "node-cron";
import { Project, PROJECTENUM } from "../models/project.model";

export const projectStatusJob = (): void => {
  try {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running the cron jon daily at 12AM");
      const today = new Date();

      const ongoing = await Project.updateMany(
        {
          startDate: { $lte: today },
          endDate: { $gte: today },
          status: { $ne: PROJECTENUM.COMPLETED }, // don’t overwrite completed
        },
        { $set: { status: PROJECTENUM.ONGOING } }
      );

      const result = await Project.updateMany(
        {
          endDate: {
            $lt: today,
          },
          status: {
            $ne: PROJECTENUM.COMPLETED,
          },
        },
        {
          $set: {
            status: PROJECTENUM.MISSED,
          },
        }
      );
      console.log(`✅ Updated ${result.modifiedCount} projects`);
    });
  } catch (err: any) {
    console.log(`Error in cron job for project ${err}`);
  }
};
