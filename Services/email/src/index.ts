import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { Pool } from "pg"; // Using Pool for connection pooling
import sentEmail from "./controllers/sentEmail";
import { getEmails } from "./controllers";
 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});


// routes 
 
app.post("/emails/send-email", sentEmail);
app.get("/emails", getEmails);
 

// 404 Not Found handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});



// Error handling middleware
interface ErrorWithStack extends Error {
  stack?: string;
}

app.use(
  (err: ErrorWithStack, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error occurred:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

// Environment Variables Validation
const port = Number(process.env.PORT) || 4004;
const serviceName = process.env.SERVICE_NAME || "user_service";

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in .env");
  process.exit(1); // Exit the application if DATABASE_URL is missing
}

// Use Pool instead of Client for connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  max: 20, // Max number of connections in the pool
  idleTimeoutMillis: 30000, // Timeout for idle connections in ms
  connectionTimeoutMillis: 2000, // Timeout for acquiring a new connection in ms
});

// Test the connection
pool
  .connect()
  .then(() => {
    console.log("Successfully connected to the PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the application if the connection fails
  });

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit process after logging the error
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1); // Exit process after logging the error
});

// Start the server after DB connection is successful
pool
  .connect()
  .then(() => {
    app.listen(port, "localhost", () => {
      console.log(`${serviceName} is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the application if connection fails
  });

// Keep the app alive for testing
// setInterval(() => {
//   console.log("App is running...");
// }, 60000); // Print a message every minute
