interface UserList {
  userName: string;
  // fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  password: string;
  contactNumber: string;
  role: string;
}

export const addUser: UserList[] = [
  {
    // fullName: "ShreyashSalian",
    firstName: "Admin",
    lastName: "Admin",
    designation: "admin",
    email: "admin@gmail.com",
    password: "Admin@123",

    userName: "ShreyashSalian",
    role: "admin",
    contactNumber: "1234567890",
  },
  {
    // fullName: "Admin Admin",
    firstName: "Admin",
    lastName: "Admin",
    designation: "admin",
    email: "admin123@gmail.com",
    userName: "AdminAdmin",
    password: "Admin@123",
    role: "admin",
    contactNumber: "987654321",
  },
  {
    // fullName: "Rohit sharma",
    firstName: "Rohit",
    lastName: "Sharma",
    designation: "developer",
    email: "rohit@gmail.com",
    password: "Rohit@123",
    userName: "RohitSharma",
    role: "user",
    contactNumber: "1231231231",
  },
  {
    // fullName: "Virat Kohli",
    firstName: "Virat",
    lastName: "kohli",
    designation: "developer",
    email: "virat23@gmail.com",
    userName: "ViratKholi",
    password: "Virat@123",
    role: "user",
    contactNumber: "987654311",
  },
  {
    // fullName: "Derran sam",
    firstName: "Dareen",
    lastName: "Sam",
    designation: "developer",
    email: "sam123@gmail.com",
    userName: "DarrenSam",
    password: "Derran@123",
    role: "user",
    contactNumber: "987654322",
  },
];
