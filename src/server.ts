import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import connectionDB from "./config/connetDb";
import userRoute from "./router/userRouter";
import path from "path";
import morgan from "morgan";
import session, { MemoryStore } from "express-session"

const app: Application = express();
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  // Add a store configuration if needed
  // store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/assets"));

// app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(error.stack);
//   res.status(500).send("Internal Server Error");
// });

//Routs
app.use("/", userRoute);

connectionDB(); //connecting to database

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;

app.listen(port, () => {
  console.log("server listening..", port);
});

