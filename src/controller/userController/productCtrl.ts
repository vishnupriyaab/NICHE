import { Request,Response } from "express";import productDb from "../../model/productModel";
import userDb from "../../model/userModel";
import CartDb from "../../model/cartModel";



export async function getsingleProduct(req: Request, res: Response) {
    try {
      const product = await productDb.findOne({ _id: req.params.id }).populate("offer");
      // console.log(product?.offer.discountPercentage,"productttttttttt");
      console.log(product?.offerApplied,"111111");
      
      const userid = req.session.userId;
      const user = await userDb.findById(userid);
      const cart = await CartDb.findOne({userId :user}).populate("products");
      res
        .status(200)
        .render("user/singleProductpage", { product, user, cart });
        
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }