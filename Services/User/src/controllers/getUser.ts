import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { User } from "../../generated/prisma";
 
 
 
 
 
const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Get the user ID from the URL
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const field = typeof req.query.field === "string" ? req.query.field : null;
        if (field && field !== "authUserId") {
            return res.status(400).json({ message: "Invalid field parameter" });
        }

        let user: User | null;

        if (field === "authUserId") {
            user = await prisma.user.findUnique({
                where: { authUserId: id }
            });
        } else {
            user = await prisma.user.findUnique({
                where: { id }
            });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
};

export default getUser;


