import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const emailVerficationValidation = () => {
  return checkSchema({
    token: {
      notEmpty: {
        errorMessage: "Please enter the token",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
