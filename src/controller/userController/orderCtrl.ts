import { Request, Response } from "express";
import mongoose from "mongoose";
import Addressdb from "../../model/addressModel";
import CartDb from "../../model/cartModel";
import productDb from "../../model/productModel";
import {  SessionData } from "express-session";
import userDb from "../../model/userModel";
import orderDb from "../../model/orderModel";
import Orderdb from "../../model/orderModel";
import Razorpay from "razorpay";
import crypto from "crypto";
import Walletdb from "../../model/walletModel";
import CouponDb from "../../model/couponModel";

export async function checkout(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    const wallet = await Walletdb.find({ userId: req.session.userId });
    const address = await Addressdb.find({ userId: user });
    const coupon = await CouponDb.find({ isDeleted: false });

    const productid = await CartDb.findOne({
      userId: new mongoose.Types.ObjectId(user),
    });

    const products = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(user) },
      },
      {
        $unwind: {
          path: "$products",
        },
      },
      {
        $lookup: {
          from: "productdbs",
          localField: "products.productId",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
      {
        $unwind: {
          path: "$productsDetails",
        },
      },
    ]);

    const sum = products.reduce((total, product) => {
      // Ensure product and productDetails exist
      return (total +=
        product.products.quantity * product.productsDetails.price);
    }, 0);

    res.status(200).render("user/checkout", {
      address,
      sum,
      products,
      productid,
      user,
      cart,
      wallet,
      coupon
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Error during checkout");
  }
}

export async function addAddress(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    res.status(200).render("user/addaddress", { user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function showAddress(req: Request, res: Response) {
  try {
    let user = req.session.userId;
    const address = await Addressdb.find({ userId: user });
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    res.status(200).render("user/showaddress", { address, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function editAddress(req: Request, res: Response) {
  try {
    // Type casting req.session to MySessionData
    const user = req.session.userId;
    const cart  = await CartDb.find();
    (req.session as SessionData).addressId = req.params.id;
    const address = await Addressdb.findOne({
      _id: (req.session as SessionData).addressId,
    });
    res.status(200).render("user/editAddress", { address, user, cart});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function checkAddress(req: Request, res: Response): Promise<void> {
  try {
    const address = await Addressdb.findOne({ userId: req.session.userId });

    if (!address) {
      res.status(404).json({ message: "No address found" });
      return;
    }

    res.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function placeorder(req: Request, res: Response) {
  try {




    const { paymentMethod, address, price } = req.body;
    const totalsum: any = price.split(" ")[1];
    (req.session as any).sum = totalsum;
    // Check if address and paymentMethod are provided
    if (!paymentMethod || !address) {
      throw new Error("Payment method and address are required.");
    }
    if (paymentMethod === "Razorpay") {
      var instance = new Razorpay({
        key_id: process.env.RZP_KEY_ID as string,
        key_secret: process.env.RZP_KEY_SECRET as string,
      });

      (req.session as any).paymentMethod = paymentMethod;
      (req.session as any).address = address;

      var options = {
        amount: totalsum * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",
      };
      instance.orders.create(options, function (err, order) {
        return res.json({ order });
      });
    }

    if (paymentMethod === "COD") {
      let user = req.session.userId;

      const userId = await userDb.findById(user);
      const currentDate = new Date();

      const cartItems = await CartDb.aggregate([
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

      const orderItems = cartItems.map((element) => {
        const orderItem = {
          productId: element.products.productId,
          pName: element.productsDetails.name,
          price: element.productsDetails.price * element.products.quantity,
          pImage: element.productsDetails.imgArr[0],
          quantity: element.products.quantity,
          address: address,
          paymentMethod: paymentMethod,
          orderStatus: "Ordered",
          orderDate: currentDate,
        };
        return orderItem;
      });

      // Create a new order instance
      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
      });

      // Save the order to the database
      await newOrder.save();

      const a = await CouponDb.updateOne(
        { couponCode: req.session.couponCode },
        { $push: { userUsed: req.session.userId } }
        );
  
      delete (req.session as any).address;
      delete (req.session as any).sum;
      delete (req.session as any).paymentMethod;
      delete (req.session as any).couponCode;

      await clearUserCart(req.session.userId);
      res.status(200).json({ message: "Order placed successfully!" });
    }

    if (paymentMethod === "Cwallet") {
      const wallet = await Walletdb.findOne({ userId: req.session.userId });

      const products = await CartDb.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $lookup: {
            from: "productdbs",
            localField: "products.productId",
            foreignField: "_id",
            as: "productsDetails",
          },
        },
        {
          $unwind: {
            path: "$productsDetails",
          },
        },
      ]);

      const sum = products.reduce((total, product) => {
        // Ensure product and productDetails exist
        return (total +=
          product.products.quantity * product.productsDetails.price);
      }, 0);

      if( !wallet || (sum>wallet.walletBalance)){
        res.json({ message: "You can't use this Wallet, bc'z your total amount is greater than your wallet amount" });
      }
    }
  } catch (error: any) {
    console.error("Error saving order:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function orderRazorpayVerification(req: Request, res: Response) {
  try {
    const instance = new Razorpay({
      key_id: process.env.RZP_KEY_ID as string,
      key_secret: process.env.RZP_KEY_SECRET as string,
    });

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body_data = razorpay_order_id + "|" + razorpay_payment_id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET as string)
      .update(body_data)
      .digest("hex");

    const isValid = generated_signature === razorpay_signature;

    if (isValid) {
      let user = req.session.userId;

      const userId = await userDb.findById(user);
      const currentDate = new Date();

      const cartItems = await CartDb.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
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

      const orderItems = cartItems.map((element) => {
        const orderItem = {
          productId: element.products.productId,
          pName: element.productsDetails.name,
          price: element.productsDetails.price * element.products.quantity,
          pImage: element.productsDetails.imgArr[0],
          quantity: element.products.quantity,
          address: (req.session as any).address,
          paymentMethod: (req.session as any).paymentMethod,
          orderStatus: "Ordered",
          orderDate: currentDate,
        };
        return orderItem;
      });

      // Create a new order instance
      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
      });

      // Save the order to the database
      await newOrder.save();

      delete (req.session as any).address;
      delete (req.session as any).sum;
      delete (req.session as any).paymentMethod;

      await clearUserCart(req.session.userId);

      res.status(200).redirect("/successpage");
    }
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error while verifying", error);
    res.status(500).send("Error verifiying razorpay payment");
  }
}

async function clearUserCart(userId: string | undefined) {
  try {
    // Find all cart items associated with the user
    const cartItems = await CartDb.findOne({ userId: userId });

    if (!cartItems) {
      console.log("User has no items in the cart");
      return; // Exit the function early if cartItems is null
    }

    for (const cartItem of cartItems.products) {
      await decreaseProductStock(cartItem.productId, cartItem.quantity);

      // Delete the cart item
      await CartDb.findByIdAndDelete(cartItems._id);
    }

    console.log("User cart cleared successfully");
  } catch (error) {
    console.error("Error clearing user cart:", error);
  }
}

async function decreaseProductStock(productId: any, quantity: number) {
  try {
    // Find the product by ID
    const product = await productDb.findOne({ _id: productId });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Decrease the stock quantity
    product.stock -= quantity;

    // Save the updated product
    await product.save();
  } catch (error) {
    console.error("Error decreasing product stock:", error);
    // Handle error appropriately
  }
}

export async function cancelOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;

  try {
    // Find the order by ID
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Cancelled" } },
      { projection: { "orderDetails.$": 1 } }
    );

    // Add the quantity back to product stock
    const product = await productDb.findOneAndUpdate(
      { _id: order?.orderDetails[0].productId },
      { $inc: { quantity: order?.orderDetails[0].quantity } }
    );

    if (
      order?.orderDetails[0].orderStatus == "Ordered" ||
      order?.orderDetails[0].orderStatus == "Cancelled"
    ) {
      if (order?.orderDetails[0].paymentMethod == "Razorpay") {
        const user = await userDb.findOne({ _id: req.session.userId });
        if (!user) {
          throw new Error("User not found");
        }

        const amount =
          Number(order.orderDetails[0].price) *
          Number(order.orderDetails[0].quantity);

        await Walletdb.updateOne(
          { userId: req.session.userId },
          {
            $inc: { walletBalance: amount },
            $push: { transactions: { amount: amount, type: "+ CREDIT" } },
          },
          { upsert: true }
        );
      }
    }

    res.status(200).send("Order cancelled successfully");
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error cancelling order:", error);
    res.status(500).send("Error cancelling order");
  }
}

export async function successPage(req: Request, res: Response) {
  try {
    const userid = req.session.userId;
    const user = await userDb.findById(userid);
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    res.status(200).render("user/successpage", { user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function orderslist(req: Request, res: Response) {
  try {
    const cartItems = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
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

    const userid = req.session.userId;

    const user = await userDb.findOne({ _id: req.session.userId });
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    const orders = await Orderdb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userid) },
      },
      { $unwind: "$orderDetails" },
      { $sort: { "orderDetails.orderDate": -1 } },
    ]);
    // console.log(orders);
    res.render("user/ordersList", { orders, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function orderInfo(req: Request, res: Response) {
  try {
    const user = await userDb.findOne({ _id: req.session.userId });
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    const proid = req.params.id;
    const details = await Orderdb.findOne(
      { "orderDetails._id": new mongoose.Types.ObjectId(proid) },
      { "orderDetails.$": 1, _id: 1, userId: 1 }
    );
    res.render("user/orderInfo", { details, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function returnOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;
  try {
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Returned" } },
      { projection: { "orderDetails.$": 1 } }
    );

    // Check if order is null
    if (!order) {
      throw new Error("Order not found");
    }

    const product = await productDb.findOneAndUpdate(
      { _id: order.orderDetails[0].productId },
      { $inc: { quantity: order.orderDetails[0].quantity } }
    );

    if (order.orderDetails[0].orderStatus == "Delivered") {
      const user = await userDb.findOne({ _id: req.session.userId });
      if (!user) {
        throw new Error("User not found");
      }

      const refundorder = await Orderdb.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.session.userId),
          },
        },
        {
          $unwind: "$orderDetails",
        },
      ]);

      const amount =
        Number(refundorder[0].orderDetails.price) *
        Number(refundorder[0].orderDetails.quantity);

      await Walletdb.updateOne(
        { userId: req.session.userId },
        {
          $inc: { walletBalance: amount },
          $push: { transactions: { amount: amount, type: "+ CREDIT" } },
        },
        { upsert: true }
      );
    }
    res.status(200).send("Order returned successfully");
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error returning order:", error);
    res.status(500).send("Error returning order");
  }
}
