import { NextFunction, Request, Response } from "express";
import { EmailCreateSchema } from "../schema";
import { defaultSender, transporter } from "../config";
import prisma from "../prisma";

const sentEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate the request body
        const parsedBody = EmailCreateSchema.parse(req.body);
        if (!parsedBody) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        // Create mail options
        const { sender, recipient, subject, body, source } = parsedBody;
        const from = sender || defaultSender;
        const mailOptions = {
            from,
            to: recipient,
            subject: subject,
            text: body,
        };

        // Send email
        const { rejected } = await transporter.sendMail(mailOptions);
        if (rejected.length) {
            console.log("Rejected email:", rejected);
            return res.status(500).json({ message: "Email rejected" });
        }

        // Save to database
        console.log('Prisma client:', prisma); // Debug log
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }
        await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source,
            }
        });

        return res.status(200).json({ message: "Email sent" });

    } catch (error) {
        console.error("Error in sentEmail:", error);
        next(error);
    }
}

export default sentEmail;