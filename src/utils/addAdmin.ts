import { User } from "../models/user.model";
import { addUser } from "./adminUserList";

export const addAdminFromList = async (): Promise<void> => {
  try {
    for (let user of addUser) {
      const userExist = await User.findOne({
        $or: [
          {
            email: user.email,
          },
          {
            userName: user.userName,
          },
        ],
      });
      if (!userExist) {
        const userCreation = await User.create({
          // fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: user.userName,
          role: user.role,
          contactNumber: user.contactNumber,
          password: user.password,
          designation: user.designation,
        });
        console.log(
          `${user.firstName} : ${user.lastName} has been added successfully`
        );
      }
    }
  } catch (err: any) {
    console.log(err);
  }
};
