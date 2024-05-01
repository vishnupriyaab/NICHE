import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import connectionDB from "./config/connetDb";
import userRoute from "./router/userRouter";
import path from "path";
import session, { MemoryStore } from "express-session"
import adminRoute from "./router/adminRoute";
import flash from 'express-flash'
import fileupload from "express-fileupload";
import BodyParser  from 'body-parser';
// import morgan from "morgan";


const app: Application = express();

app.use(fileupload({
  useTempFiles:true,    
  limits: { fileSize: 2 * 1024 * 1024 },
}))

app.use(express.json({ limit: "100mb" }));
app.use(
  express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 50000 })
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

// app.use(morgan('dev'));

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

