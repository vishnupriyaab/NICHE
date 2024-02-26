import { Request, Response } from "express";
import userDb from "../../model/userModel";


export async function getUsers(req: Request, res: Response) {
    try {
      const user = await userDb.find();
      res.render("admin/users", { user });
    } catch (error: any) {
      res.status(500).send("Internal Server Error");
    }
  }

export async function blockuser(req:Request, res:Response) {
    try {
      const data = await userDb.updateOne(
        { _id: req.query.userid },
        { $set: { block: true } }
      );
      res.status(200).redirect("/users");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  
  export async function unblockuser(req:Request, res:Response) {
    try {
      const data = await userDb.updateOne(
        { _id: req.query.userid },
        { $set: { block: false } }
      );
      res.status(200).redirect("/users");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }