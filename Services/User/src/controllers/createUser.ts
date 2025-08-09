import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schema";
 


const createUser = async (req:Request, res:Response, next:NextFunction) => {
    try {
        
        //validate request body
        const parsedBody = UserCreateSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: parsedBody.error.issues ,
            });
        }
        // Check if user already exists
        // Assuming authUserId is unique for each user
        const existingUser = await prisma.user.findUnique({
            where: {
                authUserId: parsedBody.data.authUserId,
            },  
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        // Create user
        const user = await prisma.user.create({
            data: parsedBody.data,
        });
        return res.status(201).json({
            message: "User created successfully",
            user,
        });


    } catch (error) {
       next(error);
        
    }
}

export default createUser;