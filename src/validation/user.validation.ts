import { checkSchema, Meta } from "express-validator";
import { trimInput } from "../utils/function";
import fs from "fs";

const deleteFile = (file: Express.Multer.File | undefined) => {
  if (file) {
    fs.unlinkSync(file.path);
  }
};

// Allowed file types and maximum size
const allowedMimeTypes = ["image/jpeg", "image/png"];
const maxSize = 2 * 1024 * 1024; // 2MB

export const userValidation = () => {
  return checkSchema({
    firstName: {
      notEmpty: {
        errorMessage: "Please enter the fullname",
      },
      matches: {
        options: [/[a-zA-Z\s]+$/],
        errorMessage: "Please enter only string in fullName",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    lastName: {
      notEmpty: {
        errorMessage: "Please enter the lastname",
      },
      matches: {
        options: [/[a-zA-Z\s]+$/],
        errorMessage: "Please enter only string in lastname",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    userName: {
      notEmpty: {
        errorMessage: "Please enter the userName",
      },
      matches: {
        options: [/[a-zA-Z0-9\s@#]+$/],
        errorMessage: "Please enter only string in user name",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    email: {
      notEmpty: {
        errorMessage: "Please enter the email",
      },
      isEmail: {
        errorMessage: "Please enter the valid email",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      matches: {
        options: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/],
        errorMessage:
          "Password must be at least 6 characters long, including a number and a special character.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Please enter the confirm password.",
      },
      customSanitizer: {
        options: trimInput,
      },
      custom: {
        options: (value: string, { req }: Meta): boolean => {
          if (value !== req.body.password) {
            throw new Error("Password and confirm password don't match.");
          }
          return true;
        },
      },
    },
    contactNumber: {
      notEmpty: {
        errorMessage: "Please enter the Contact Number",
      },
      matches: {
        // Regular expression for Indian mobile numbers
        options: [/^[6-9]\d{9}$/],
        errorMessage:
          "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      },
      // custom: {
      //   options: (value: string) => {
      //     return new Promise<boolean>((resolve, reject) => {
      //       User.findOne({ where: { contactNumber: value } })
      //         .then((user) => {
      //           if (user) {
      //             reject("The contact number already exists.");
      //           } else {
      //             resolve(true);
      //           }
      //         })
      //         .catch(() => reject("Error while checking contact number"));
      //     });
      //   },
      // },
      customSanitizer: {
        options: trimInput,
      },
    },
    profileImage: {
      custom: {
        options: (value: unknown, { req }: Meta) => {
          const file = req.files?.profileImage?.[0] as Express.Multer.File;

          if (!file) return true;

          if (!allowedMimeTypes.includes(file.mimetype)) {
            deleteFile(file);
            throw new Error("Only .jpeg and .png formats are allowed.");
          }

          if (file.size > maxSize) {
            deleteFile(file);
            throw new Error("Image size should not exceed 2MB.");
          }

          return true;
        },
      },
    },

    proofPhoto: {
      custom: {
        options: (value: any, { req }: Meta) => {
          const files = req.files?.proofPhoto as Express.Multer.File[];

          if (!Array.isArray(files) || files.length === 0) {
            throw new Error("Please upload at least one proof image.");
          }

          for (const file of files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
              files.forEach((f) => fs.unlinkSync(f.path));
              throw new Error("Only .jpeg and .png formats are allowed.");
            }
            if (file.size > 3 * 1024 * 1024) {
              files.forEach((f) => fs.unlinkSync(f.path));
              throw new Error("Image size should not exceed 3MB.");
            }
          }

          return true;
        },
      },
    },
    role: {
      notEmpty: {
        errorMessage: "Please enter the role.",
      },
    },
    designation: {
      notEmpty: {
        errorMessage:
          "Please enter the designation : (Developer/Designer/Tester/Network).",
      },
    },
    salary: {
      notEmpty: {
        errorMessage: "Please enter the salary for the employee.",
      },
    },
    joiningDate: {
      notEmpty: {
        errorMessage: "Please enter the Joining date for the employee.",
      },
    },
  });
};
