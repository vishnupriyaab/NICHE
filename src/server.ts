import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import connectionDB from "./config/connetDb";

const app: Application = express();
app.use(express.json())

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack);
  res.status(500).send("Internal Server Error"); 
});

connectionDB(); //connecting to database

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;

app.listen(port, () => {
  console.log("server listening..", port);
});
