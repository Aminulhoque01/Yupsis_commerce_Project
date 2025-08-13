// import { NextFunction, Request, Response } from "express";
 
// import prisma from "../prisma";
// import bcrypt from "bcryptjs";
// import axios from "axios";
// import { UserCreateSchema } from "../schema";

// const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const parsedBody = UserCreateSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//       return res.status(400).json({
//         message: parsedBody.error.issues,
//       });
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         email: parsedBody.data.email,
//       },
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists",
//       });
//     }

//     // Hash the password before saving
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

//     // Create auth user
//     const user = await prisma.user.create({
//       data: {
//         ...parsedBody.data,
//         password: hashedPassword, // Save the hashed password
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         status: true,
//         createdAt: true,
//         verified: true,
//       },
//     });

//     console.log(`User created successfully with ID: ${user.id}`);

//     // Attempt to create user profile in user service
//     try {
//       console.log(`USER_SERVICE_URL: ${process.env.USER_SERVICE_URL}`);
//       await axios.post(
//         `${process.env.USER_SERVICE_URL}/users`,
//         {
//           authUserId: user.id,
//           email: user.email,
//           name: user.name,
//           role: user.role,
//           status: user.status,
//           createdAt: user.createdAt,
//           verified: user.verified,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     } catch (axiosError) {
//       if (axiosError instanceof Error) {
//         console.error("Failed to create user profile in user service:", axiosError.message);
//       } else {
//         console.error("Failed to create user profile in user service:", axiosError);
//       }
//       if (
//         typeof axiosError === "object" &&
//         axiosError !== null &&
//         "response" in axiosError &&
//         typeof (axiosError as any).response === "object"
//       ) {
//         console.error("Response data:", (axiosError as any).response.data);
//         console.error("Response status:", (axiosError as any).response.status);
//       }
//       // Optionally continue with registration instead of failing
//     }

//     return res.status(201).json({
//       message: "User registered successfully",
//       user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export default userRegistration;