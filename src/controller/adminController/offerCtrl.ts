import Offerdb from "../../model/offerModel";
import { Request,Response } from "express";



export async function offer(req:Request, res:Response) {
    try {
      const offer = await Offerdb.find();
      res.render("admin/adminOffer", { offer });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }