import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import connectionDB from "./config/connetDb";
import userRoute from "./router/userRouter";
import path from "path";
import morgan from "morgan";
import session, { MemoryStore } from "express-session"
import adminRoute from "./router/adminRoute";
import flash from 'express-flash'

const app: Application = express();
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
  res.setHeader("Pragma", "no-cache"); 
  res.setHeader("Expires", "0");
  next()
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
}));

app.use(flash());

//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/assets"));


//Routs
app.use("/", userRoute);
app.use("/", adminRoute);

connectionDB(); //connecting to database

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;

app.listen(port, () => {
  console.log("server listening..", port);
});

