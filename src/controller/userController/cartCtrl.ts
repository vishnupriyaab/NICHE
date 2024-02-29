import { Request, Response } from "express";
import CartDb from "../../model/cartModel";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import productDb from "../../model/productModel";

export async function cart(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");

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
      // Ensure product and productDetails exist
      if (product.products && product.productsDetails) {
        total += product.products.quantity * product.productsDetails.price;
      }
      return total;
    }, 0);
    res.status(200).render("user/cart", { products, sum, user, cart });
  } catch (error) {
    console.error(error,"error");
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
    cart.products.push({ productId, quantity: quantity, price: product.price });

    await cart.save();
    res.status(201).json({ message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
}

export async function updatequantity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quantity, productId } = req.body;
    console.log(req.body);

    const productDetails = await productDb.findById(productId);
    const existingCart = await CartDb.findOne({ userId: req.session.userId });
    const exstingProduct = existingCart?.products.find((product) =>
      product.productId.equals(new mongoose.Types.ObjectId(productId))
    );

    if (existingCart && exstingProduct && productDetails?.isHidden === true) {
      const newQnty = quantity + exstingProduct.quantity;
      if (newQnty <= productDetails.stock) {
        exstingProduct.quantity = newQnty;
        // Assuming existingCart.cartTotal is a Number type
        existingCart.cartTotal =
          existingCart.cartTotal.valueOf() + quantity * productDetails.price;
          await existingCart.save();
          res.status(200).json({success:true , message:"Quantity updated successfully"})
          return;
      }else{
        res.status(200).json({success:false , message:"Requested quantity exceeds available quantity"})

      }
    }else{
      res.status(200).json({success:false , message:"Product not Found in the Cart"})
    }
    res.send(true);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
}

// export async function reloadTotalAmount(req: Request, res: Response) {
//   try {

//     const userid = req.session.userId;

//     const products = await CartDb.aggregate([
//       {
//         $match: { userId: new mongoose.Types.ObjectId(userid) },
//       },
//       {
//         $unwind: "$products",
//       },
//       {
//         $lookup: {
//           from: productDb.collection.name,
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productsDetails",
//         },
//       },
//       {
//         $unwind: "$productsDetails",
//       },
//     ]);

//     // const sum = products[0].products.quantity * products[0].productsDetails.price
//     const sum = products.reduce((total, product) => {
//       // Ensure product and productDetails exist
//       if (product.products && product.productsDetails) {
//         total += product.products.quantity * product.productsDetails.price;
//       }
//       return total;
//     }, 0);

//     const amt = products.reduce((total, product) => {
//       if (String(product.products.productId) === req.params.productId) {
//         total += product.products.quantity * product.productsDetails.price
//       }
//       return total;
//     }, 0);

//     res.status(200).json({ updatedTotalAmount: sum, amt });

//   } catch (error) {
//     console.log(error);
//   }
// }
