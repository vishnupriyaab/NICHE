import Walletdb from "../../model/walletModel";
import { Request,Response } from "express";


export async function wallet(req:Request, res:Response) {
    try {
      const wallet = await Walletdb.find({ userId: req.session.userId });
      res.render("user/wallet", { wallet });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }