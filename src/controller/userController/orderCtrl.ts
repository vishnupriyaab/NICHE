import { Request,Response } from "express";
import mongoose from "mongoose";
import Addressdb from "../../model/addressModel";
import CartDb from "../../model/cartModel";
import productDb from "../../model/productModel";

export async function checkout(req:Request, res:Response) {
    try {
      const user = req.session.userId;
      const cart = await CartDb.findOne({ userId: user }).populate("products");
      const address = await Addressdb.find({ userId: user });
  
      const productid = await CartDb.findOne({
        userId: new mongoose.Types.ObjectId(user),
      });
  
      const products = await CartDb.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(user) },
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: productDb.collection.name,
            localField: "products.productId",
            foreignField: "_id",
            as: "productsDetails",
          },
        },
        {
          $unwind: "$productsDetails",
        },
      ]);
  
      // console.log(products);
  
      const sum = products.reduce((total, product) => {
        // Ensure product and productDetails exist
        if (product.products && product.productsDetails) {
          total += product.products.quantity * product.productsDetails.price;
        }
        return total;
      }, 0);
  
      res
        .status(200)
        .render("user/checkout", { address, sum, products, productid, user ,cart});
    } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).send("Error during checkout");
    }
  }


  export async function addaddress(req:Request, res:Response) {
    try {
        const user = req.session.userId;
        const cart = await CartDb.findOne({ userId: user }).populate("products");

      res.status(200).render("user/addaddress", {user, cart });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  
export async function checkaddress(req:Request, res:Response):Promise<void> {
  try {
    // Fetch address data from the database
    const address = await Addressdb.findOne({ userId: req.session.userId });

    if (!address) {
      res.status(404).json({ message: "No address found" })
      return;
    }

    res.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}