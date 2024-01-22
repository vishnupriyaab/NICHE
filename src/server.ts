import "dotenv/config";
import express, { Application,Request,Response } from "express";
import connectionDB from "./config/connetDb";

const app:Application = express();
app.use((req:Request,res:Response)=>{
  res.send("okkkk");
})
connectionDB();
const port:number =3000;
app.listen(port, () => {
  console.log("server listening..");
});
