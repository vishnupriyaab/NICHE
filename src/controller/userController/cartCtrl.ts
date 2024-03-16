import { Request, Response } from "express";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import productDb from "../../model/productModel";
import CartDb from "../../model/cartModel";





export async function cart(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user })
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

    console.log(products);

    const sum = products.reduce((total, product) => {
      if (product.products && product.productsDetails) {
        total += product.products.quantity * product.productsDetails.price;
      }
      return total;
    }, 0);
    res.status(200).render("user/cart", { products, sum,user,cart });
  } catch (error) {
    console.error(error, "error");
    res.status(500).send("Internal Server Error");
  }
}



export async function addTocart(req: Request, res: Response): Promise<void> {
  try {
    let userId = req.session.userId;
    if (!userId) {
      res.status(200).json({ message: "Please Login" });
      return;
    }
    const { id, quantity } = req.body;
    const productId = id;

    const product = await productDb.findById(productId);
    if (!product) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    const same = await CartDb.findOne({
      userId: userId,
      "products.productId": productId,
    });
    if (same) {
      res.status(200).json({ message: "Product already in cart" });
      return;
    }
    let cart = await CartDb.findOne({ userId });
    if (!cart) {
      cart = await CartDb.create({ userId });
    }

    const itemIndex = cart.products.findIndex((p) => p.productId === productId);
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += quantity;
      console.log(typeof quantity,"quantity");
      console.log(quantity,"567");
      

    } else {
      cart.products.push({
        productId,
        quantity: quantity,
        price: product.price,
      });
      // cart.cartTotal += quantity*product.price;
    }
    // console.log(typeof cart.cartTotal,"cart.carttotal");
    
    await cart.save();
    res.status(201).json({ message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
}

export async function updateQuantity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quantity, productId } = req.body;

    console.log(quantity);

    let inventory = await productDb.findOne({ _id: productId });

    if (!inventory) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (inventory.stock < quantity) {
      res.status(401).json({ stockErr: true, message: "Out of Stock" });
      return;
    }

    await CartDb.updateOne(
      { userId: req.session.userId, "products.productId": productId },
      { $set: { "products.$.quantity": quantity } }
    );

    const cart = await CartDb.findOne({ "products.productId": productId });

    const result = await CartDb.aggregate([
      {
        $match: {
          "products.productId": new mongoose.Types.ObjectId(productId),
        },
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
    res.send(true);
  } catch (error) {
    console.log(error);
  }
}

export async function reloadTotalAmount(req: Request, res: Response) {
  try {
    const userid = req.session.userId;

    const products = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userid) },
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

    const sum = products.reduce((total, product) => {
      if (product.products && product.productsDetails) {
        if (String(product.products.productId) === req.params.productId) {
          return (total +=
            (product.products.quantity + req.body.change) *
            product.productsDetails.price);
        }
        total += product.products.quantity * product.productsDetails.price;
      }
      return total;
    }, 0);

    const updatedProduct = products.find(
      (product) => String(product.products.productId) === req.params.productId
    );

    const amt =
      (updatedProduct.products.quantity + req.body.change) *
      updatedProduct.productsDetails.price;

    res.status(200).json({ updatedTotalAmount: sum, amt });
  } catch (error) {
    console.log(error);
  }
}

export async function removeProductfromcart(req: Request, res: Response) {
  try {
    const { userId, productId } = req.body;
    console.log(req.body);
    // Remove the product from the user's cart
    const data = await CartDb.updateOne(
      { userId },
      { $pull: { products: { productId } } }
    );
    res
      .status(200)
      .json({ message: "Product removed from the cart successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
}
