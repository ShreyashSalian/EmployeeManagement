import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const loginValidation = () => {
  return checkSchema({
    userNameOrEmail: {
      notEmpty: {
        errorMessage: "Please enter the userName or email for login.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
