import { NextFunction, Request, Response } from "express";
import { UserLoginSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttemp } from "../generated/prisma";


type LoginHistory = {
    userId: string;
    ipAddress: string | undefined;
    userAgent: string | undefined;
    attempt: LoginAttemp;
}

const createLoginHistory = async (history: LoginHistory) => {
    await prisma.loginHistory.create({
        data: {
            userId: history.userId,
            ipAddress: history.ipAddress || "",
            userAgent: history.userAgent || "",
            attempt: history.attempt || new Date(),
        }
    })
}



const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // history tracking
        // You can implement a history tracking mechanism here if needed
        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || "";
        const userAgent = req.headers['user-agent'] || "";

        // Validate request body
        const parsedBody = UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
            select: {
                id: true,
                email: true,
                password: true, // Include password for comparison
                name: true,
                role: true,
                status: true,
                createdAt: true,
                verified: true,
            }
        })

        if (!user) {
            // Log the login attempt
            await createLoginHistory({
                userId: "",
                ipAddress,
                userAgent,
                attempt: LoginAttemp.FAILED,
            });
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // compare passwords
        const isPasswordValid = await bcrypt.compare(parsedBody.data.password, user.password);
        if (!isPasswordValid) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttemp.FAILED,
            });
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        //check if user is verified
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttemp.FAILED,
            });
            return res.status(403).json({
                message: "User is not verified",
            });
        }

        //check if user is active
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: `User is not active, current status: ${user.status.toLocaleLowerCase()}`,
            });
        }

        //ganarate JWT token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        )
        await createLoginHistory({
            userId: user.id,
            ipAddress,
            userAgent,
            attempt: LoginAttemp.SUCCESS,
        });

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                verified: user.verified,
            }
        });

    } catch (error) {
        next(error);
    }
};


export default userLogin;