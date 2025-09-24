import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";
import mongoose from "mongoose";

export const projectValidation = () => {
  return checkSchema({
    title: {
      notEmpty: {
        errorMessage: "Please enter the title for the project",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Please enter the description for the project",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    startDate: {
      notEmpty: {
        errorMessage: "Please enter the title for the project",
      },
      isISO8601: {
        errorMessage: "Start date must be valid date.",
      },
    },
    endDate: {
      notEmpty: {
        errorMessage: "Please enter the title for the project",
      },
      isISO8601: {
        errorMessage: "End date must be a valid date.",
      },
      custom: {
        options: (value, { req }) => {
          if (new Date(value) < new Date(req.body.startDate)) {
            throw new Error("End date cannot be earlier than start date.");
          }
          return true;
        },
      },
    },

    status: {
      notEmpty: {
        errorMessage: "Please enter the title for the project",
      },
      isIn: {
        options: [["pending", "ongoing", "completed"]],
        errorMessage: "Status must be pending, ongoing, or completed",
      },
    },
    teamMember: {
      notEmpty: {
        errorMessage: "Please enter the title for the project",
      },
      custom: {
        options: (value: any[]) => {
          if (!value || value.length === 0) {
            throw new Error("Please provide at leasr one team members");
          }
          for (const member of value) {
            if (!mongoose.Types.ObjectId.isValid(member)) {
              throw new Error(`Invalid team member ID:${member}`);
            }
          }
          return true;
        },
      },
    },

    department: {
      notEmpty: {
        errorMessage: "Please enter the department for the project.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
