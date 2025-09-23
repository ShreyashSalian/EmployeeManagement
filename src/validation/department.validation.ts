import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const departmentValidation = () => {
  return checkSchema({
    name: {
      notEmpty: {
        errorMessage: "Please enter the department name.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Please enter the detail for the department.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    manager: {
      notEmpty: {
        errorMessage: "Please enter the manager name for the department",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
