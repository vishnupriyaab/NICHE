import { Request, Response } from "express";
import mongoose from "mongoose";
import Wishlistdb from "../../model/wishlistModel";
import productDb from "../../model/productModel";
import CartDb from "../../model/cartModel";

export async function wishlist(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    const wishlist = await Wishlistdb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
      },
      { $unwind: "$products" },
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

    // console.log(wishlist);

    res.render("user/wishlist", { wishlist, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function addToWishlist(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let userId = req.session.userId;
    if (!userId) {
      res.status(200).json({ message: "Please Login" });
      return;
    }

    const { productId } = req.body;

    const dup = await Wishlistdb.findOne({
      userId: userId,
      "products.productId": productId,
    });

    if (dup) {
      res.status(200).json({ message: "Product already in wishlist" });
      return;
    }

    const wishlist = await Wishlistdb.updateOne(
      { userId: req.session.userId },
      {
        $push: { products: { productId: productId } },
      },
      { upsert: true }
    );

    res.status(200).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    // Remove the product from the user's wishlist
    const data = await Wishlistdb.updateOne(
      { userId: req.session.userId }, // Assuming userId is stored in session
      { $pull: { products: { productId: productId } } }
    );

    

    console.log(data, "hjkl");
    res
      .status(200)
      .json({ message: "Product removed from the wishlist successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
}
