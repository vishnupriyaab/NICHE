import categoryDb from "../../model/categoryModel";
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

  export async function addCategoryOffer(req:Request, res:Response) {
    try {
        const category = await categoryDb.find();
      res.render("admin/addCategoryOffer",{category});
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }