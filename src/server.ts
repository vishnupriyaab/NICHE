import express, { Application,Request,Response } from "express";

const app:Application = express();

app.use((req:Request,res:Response)=>{
  res.send("okkkk");
})

const port:number =3000;
app.listen(port, () => {
  console.log("server listening..");
});
