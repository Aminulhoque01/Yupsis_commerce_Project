// import { NextFunction, Request, Response } from "express";
// import { EmailVerificationSchema } from "../schema";
// import prisma from "../prisma";
// import axios from "axios";



// const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const parsedBody = EmailVerificationSchema.safeParse(req.body);
//         if (!parsedBody.success) {
//             return res.status(400).json({
//                 message: parsedBody.error.issues,
//             });

//         }
//         // Check if user exists
//         const user = await prisma.user.findUnique({
//             where: {
//                 email: parsedBody.data.email,
//             },
//         })
//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found",
//             });
//         }
       

//         // Check if the verification code 
//         const verificationCode = await prisma.verificationCode.findFirst({
//             where: {
//                 userId: user.id,
//                 code: parsedBody.data.code,
//             },
//         })

//         if (!verificationCode) {
//             return res.status(400).json({
//                 message: "Invalid verification code",
//             });
//         }
//         // check if the code is expired
//         if (verificationCode.expiresAt < new Date()) {
//             return res.status(400).json({
//                 message: "Verification code expired",
//             });
//         }


//         // Update user verification status
//         await prisma.user.update({
//             where: {
//                 id: user.id,
//             },
//             data: {
//                 verified: true,
//                 status: "ACTIVE",
//             },
//         })

//         // send success email
//         await axios.post(`${process.env.EMAIL_SERVICE}/emails/send-email`, {
//             recipient: user.email,
//             subject: "Email Verification Successful",
//             body: "Your email has been successfully verified.",
//             source: "email_verification"
//         },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         return res.status(200).json({
//             message: "Email verified successfully ",
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 name: user.name,
//                 status: user.status,
//                 createdAt: user.createdAt,
//                 verified: user.verified
//             }
//         });

//     } catch (error) {
//         next(error);

//     }
// }


// export default verifyEmail;




import { NextFunction, Request, Response } from "express";
import { EmailVerificationSchema } from "../schema";
import prisma from "../prisma";
import axios from "axios";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Request body:", req.body); // Log the request body
        const parsedBody = EmailVerificationSchema.safeParse(req.body);
        if (!parsedBody.success) {
            console.log("Schema validation errors:", parsedBody.error.issues);
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }

        console.log("Looking up user with email:", parsedBody.data.email);
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });
        if (!user) {
            console.log("User not found for email:", parsedBody.data.email);
            return res.status(404).json({
                message: "User not found",
            });
        }

        console.log("User found:", user.id);
        // Check if the verification code exists
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: parsedBody.data.code,
            },
        });

        if (!verificationCode) {
            console.log("Invalid verification code for user:", user.id, "code:", parsedBody.data.code);
            return res.status(400).json({
                message: "Invalid verification code",
            });
        }

        // Check if the code is expired
        if (verificationCode.expiresAt < new Date()) {
            console.log("Expired verification code for user:", user.id);
            return res.status(400).json({
                message: "Verification code expired",
            });
        }

        // Update user verification status
        console.log("Updating user verification status for:", user.id);
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verified: true,
                status: "ACTIVE",
            },
        });

        // Send success email
        console.log("Sending success email to:", user.email);
        await axios.post(
            `${process.env.EMAIL_SERVICE}/emails/send-email`,
            {
                recipient: user.email,
                subject: "Email Verification Successful",
                body: "Your email has been successfully verified.",
                source: "email_verification",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                status: user.status,
                createdAt: user.createdAt,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        next(error);
    }
};

export default verifyEmail;