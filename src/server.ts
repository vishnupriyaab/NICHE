import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import connectionDB from "./config/connetDb";
import userRoute from "./router/userRouter"
import path from "path";
import morgan from 'morgan'

const app: Application = express();
app.use(express.json())
app.use(morgan("dev"))
//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname+"/assets"))

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack);
  res.status(500).send("Internal Server Error"); 
});

//Routs
app.use("/",userRoute)

connectionDB(); //connecting to database

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;

app.listen(port, () => {
  console.log("server listening..", port);
});
