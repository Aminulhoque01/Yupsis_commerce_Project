// import { NextFunction, Request, Response } from "express";
// import { UserCreateSchema } from "../schema";
// import prisma from "../prisma";
// import bcrypt from "bcryptjs";
// import axios from "axios";

// const generateVerificationToken = () => {
//   const timestamp = Date.now().toString(); // Fixed typo
//   const randomString = Math.floor(10 + Math.random() * 90);
//   let code = (timestamp + randomString).slice(-6);
//   return code;
// };

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
//         password: hashedPassword,
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
//           createdAt: user.createdAt.toISOString(), // Ensure date is in correct format
//           verified: user.verified,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     } catch (axiosError) {
//       console.error("Failed to create user profile in user service:");
//       if (axios.isAxiosError(axiosError)) {
//         console.error("Error message:", axiosError.message);
//         console.error("Response data:", axiosError.response?.data);
//         console.error("Response status:", axiosError.response?.status);
//         console.error("Response headers:", axiosError.response?.headers);
//         // Roll back user creation
//         await prisma.user.delete({
//           where: { id: user.id },
//         });
//         return res.status(500).json({
//           message: "Failed to register user due to user service error",
//         });
//       } else {
//         console.error("Unexpected error:", axiosError);
//       }
//     }
    
//     // Generate verification code
//     const code = generateVerificationToken();
//     await prisma.verificationCode.create({
//       data: {
//         userId: user.id,
//         code,
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       },
//     });

//     // Send verification email
//     try {
//       await axios.post(
//         `${process.env.EMAIL_SERVICE_URL}/emails/send-email`,
//         {
//           recipient: user.email,
//           subject: "Email Verification",
//           body: `Your verification code is ${code}. It will expire in 24 hours.`,
//           source: "user_registration",
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log(`Verification email sent to ${user.email}`);
//     } catch (emailError) {
//       console.error("Failed to send verification email:", emailError);
//       // Optionally handle email failure (e.g., notify user to request a new code later)
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





import { NextFunction, Request, Response } from "express";
import { UserCreateSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import axios from "axios";

const generateVerificationToken = () => {
  const timestamp = Date.now().toString();
  const randomString = Math.floor(10 + Math.random() * 90);
  let code = (timestamp + randomString).slice(-6);
  return code;
};

const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: parsedBody.error.issues,
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

    // Create auth user
    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        verified: true,
      },
    });

    console.log(`User created successfully with ID: ${user.id}`);

    // Attempt to create user profile in user service
    try {
      console.log(`USER_SERVICE_URL: ${process.env.USER_SERVICE_URL}`);
      await axios.post(
        `${process.env.USER_SERVICE_URL}/users`,
        {
          authUserId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
          verified: user.verified,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (axiosError) {
      console.error("Failed to create user profile in user service:");
      if (axios.isAxiosError(axiosError)) {
        console.error("Error message:", axiosError.message);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response status:", axiosError.response?.status);
        console.error("Response headers:", axiosError.response?.headers);
        // Roll back user creation
        await prisma.user.delete({
          where: { id: user.id },
        });
        return res.status(500).json({
          message: "Failed to register user due to user service error",
        });
      } else {
        console.error("Unexpected error:", axiosError);
      }
    }

    // Generate verification code
    const code = generateVerificationToken();
    console.log(`Generated verification code: ${code}`);
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    console.log(`EMAIL_SERVICE_URL: ${process.env.EMAIL_SERVICE_URL}`);
    try {
      await axios.post(
        `${process.env.EMAIL_SERVICE_URL}/emails/send-email`,
        {
          recipient: user.email,
          subject: "Email Verification",
          body: `Your verification code is ${code}. It will expire in 24 hours.`,
          source: "user_registration",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Verification email sent to ${user.email}`);
    } catch (emailError) {
      if (axios.isAxiosError(emailError)) {
        console.error("Failed to send verification email:");
        console.error("Error message:", emailError.message);
        console.error("Response data:", emailError.response?.data);
        console.error("Response status:", emailError.response?.status);
        console.error("Response headers:", emailError.response?.headers);
      } else {
        console.error("Unexpected error:", emailError);
      }
      return res.status(201).json({
        message: "User registered successfully, but failed to send verification email. Please request a new code.",
        user,
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;