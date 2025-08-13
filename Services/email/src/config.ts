// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || "localhost",
//     port: parseInt(process.env.SMTP_PORT || "2525", 10),
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.SMTP_USER || "Ami", // SMTP username
//         pass: process.env.SMTP_PASS || "ami2"  // SMTP password
//     }
// });


// export const defaultSender = process.env.DEFAULT_SENDER_EMAIL || "admin@example.com"



import nodemailer from "nodemailer";

import { config } from "dotenv";
config();
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "2525", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined
});

export const defaultSender = process.env.DEFAULT_SENDER_EMAIL || "admin@example.com";