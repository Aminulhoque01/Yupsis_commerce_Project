import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import prisma from "../prisma";
import { AccessTokenSchema } from "../schema";


const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //validate request body
        const parsedBody = AccessTokenSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }

        const { accessToken } = parsedBody.data;

        const decoded = Jwt.verify(
            accessToken,
            process.env.JWT_SECRET as string    
        )
        const user = await prisma.user.findUnique({
            where: {

                id: ( decoded as any).id,
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
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        return res.status(200).json({
            message: "Authenticated successfully",
            user,
        });


    } catch (error) {
        next(error);
    }
}

export default verifyToken;