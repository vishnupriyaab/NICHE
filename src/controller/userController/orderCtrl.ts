import { Request, Response } from "express";
import mongoose from "mongoose";
import Addressdb from "../../model/addressModel";
import CartDb from "../../model/cartModel";
import productDb from "../../model/productModel";
import { SessionData } from "express-session";
import userDb from "../../model/userModel";
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
      // Check if offer is applied
      if (product.productsDetails.offerApplied) {
        return (
          total +
          Math.round(
            product.products.quantity * product.productsDetails.offerPrice
          )
        );
      } else {
        return (
          total +
          Math.round(product.products.quantity * product.productsDetails.price)
        );
      }
    }, 0);

    // console.log(sum,"121212121212121212121212121212");

    res.status(200).render("user/checkout", {
      address,
      sum,
      products,
      productid,
      user,
      cart,
      wallet,
      coupon,
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
    const cart = await CartDb.find();
    (req.session as SessionData).addressId = req.params.id;
    const address = await Addressdb.findOne({
      _id: (req.session as SessionData).addressId,
    });
    res.status(200).render("user/editAddress", { address, user, cart });
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

export async function placeOrder(req: Request, res: Response) {
  try {
    const { paymentMethod, address, price, activeCoupon } = req.body;
    console.log(
      paymentMethod,
      address,
      price,
      activeCoupon,
      "paymentMethod, address, price"
    );
    const priceWithoutCurrency = price.replace(/[^\d.]/g, "");
    const totalsum = Number(priceWithoutCurrency);
    (req.session as any).sum = totalsum;

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
        amount: totalsum * 100,
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

      const usedCoupon = await CouponDb.findOne({ couponCode: activeCoupon });
      console.log(usedCoupon, "usedCoupon");
      let couponAmount = 0;
      if (usedCoupon) {
        couponAmount = usedCoupon.coupondiscount;
        console.log(couponAmount, "couponAmount");
      }

      const orderItems = cartItems.map((element) => {
        let orgPrice;
        let offerApplied;
        if (element.productsDetails.offerApplied === true) {
          orgPrice = Math.round(
            element.productsDetails.offerPrice * element.products.quantity
          );
          offerApplied = true;
        } else {
          orgPrice = Math.round(
            element.productsDetails.price * element.products.quantity
          );
          offerApplied = false;
        }

        let originalPrice =
          element.productsDetails.price * element.products.quantity;

        const orderItem = {
          productId: element.products.productId,
          pName: element.productsDetails.name,
          price: orgPrice,
          originalProductPrice: originalPrice,
          offerApplied: offerApplied,
          pImage: element.productsDetails.imgArr[0],
          quantity: element.products.quantity,
          address: address,
          paymentMethod: paymentMethod,
          orderStatus: "Ordered",
          orderDate: currentDate,
        };

        return orderItem;
      });
      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
        couponDiscount: couponAmount,
        couponApplied: true,
      });
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
      console.log("11");

      const wallet = await Walletdb.findOne({ userId: req.session.userId });
      console.log("222");

      const cartItems = await CartDb.aggregate([
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
      console.log("products", cartItems);

      const sum:number = cartItems.reduce((total, product) => {
        return (
          total +
          product.products.quantity *
            (product.productsDetails.price
              ? product.productsDetails.price
              : product.productsDetails.offerPrice)
        );
      }, 0);

      if (!wallet || sum >= wallet.walletBalance) {
        res.json({
          message:
            "You can't use this Wallet, bc'z your total amount is greater than your wallet amount",
        });
      } else {
        let user = req.session.userId;

        const userId = await userDb.findById(user);
        const currentDate = new Date();

        const usedCoupon = await CouponDb.findOne({ couponCode: activeCoupon });
        let couponAmount = 0;
        if (usedCoupon) {
          couponAmount = usedCoupon.coupondiscount;
          console.log(couponAmount, "couponAmount");
        }

        const orderItems = cartItems.map((element) => {
          let orgPrice;
          let offerApplied;
          if (element.productsDetails.offerApplied === true) {
            orgPrice = Math.round(
              element.productsDetails.offerPrice * element.products.quantity
            );
            offerApplied = true;
          } else {
            orgPrice = Math.round(
              element.productsDetails.price * element.products.quantity
            );
            offerApplied = false;
          }

          let originalPrice =
            element.productsDetails.price * element.products.quantity;

          const orderItem = {
            productId: element.products.productId,
            pName: element.productsDetails.name,
            price: orgPrice,
            originalProductPrice: originalPrice,
            offerApplied: offerApplied,
            pImage: element.productsDetails.imgArr[0],
            quantity: element.products.quantity,
            address: address,
            paymentMethod: paymentMethod,
            orderStatus: "Ordered",
            orderDate: currentDate,
          };

          return orderItem;
        });
        const newOrder = new Orderdb({
          userId: userId,
          orderDetails: orderItems,
          totalsum: (req.session as any).sum,
          couponDiscount: couponAmount,
          couponApplied: true,
        });
        await newOrder.save();

        const amount = sum;

      await Walletdb.updateOne(
        { userId: req.session.userId },
        {
          $inc: { walletBalance:- amount },
          $push: { transactions: { amount: amount, type: "- DEBIT" } },
        },
        { upsert: true }
      );

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
      console.log(userId, "userId");
      const currentDate = new Date();
      console.log(currentDate, "currentDate");

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

      console.log(cartItems, "cartItemsssssss");

      const orderItems = cartItems.map((element) => {
        let orgPrice;
        let offerApplied;
        if (element.productsDetails.offerApplied === true) {
          orgPrice = Math.round(
            element.productsDetails.offerPrice * element.products.quantity
          );

          offerApplied = true;
        } else {
          orgPrice = Math.round(
            element.productsDetails.price * element.products.quantity
          );
          offerApplied = false;
        }
        let originalPrice =
          element.productsDetails.price * element.products.quantity;

        const orderItem = {
          productId: element.products.productId,
          pName: element.productsDetails.name,
          price: orgPrice,
          originalProductPrice: originalPrice,
          offerApplied: offerApplied,
          pImage: element.productsDetails.imgArr[0],
          quantity: element.products.quantity,
          address: (req.session as any).address,
          paymentMethod: (req.session as any).paymentMethod,
          orderStatus: "Ordered",
          orderDate: currentDate,
        };
        return orderItem;
      });

      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
      });

      await newOrder.save();

      delete (req.session as any).address;
      delete (req.session as any).sum;
      delete (req.session as any).paymentMethod;

      await clearUserCart(req.session.userId);

      res.status(200).redirect("/successpage");
    }
  } catch (error) {
    console.error("Error while verifying", error);
    res.status(500).send("Error verifiying razorpay payment");
  }
}

async function clearUserCart(userId: string | undefined) {
  try {
    const cartItems = await CartDb.findOne({ userId: userId });
    if (!cartItems) {
      console.log("User has no items in the cart");
      return;
    }
    for (const cartItem of cartItems.products) {
      await decreaseProductStock(cartItem.productId, cartItem.quantity);
    }
    console.log("User cart cleared successfully");
  } catch (error) {
    console.error("Error clearing user cart:", error);
  }
}

async function decreaseProductStock(productId: any, quantity: number) {
  try {
    const product = await productDb.findOne({ _id: productId });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    product.stock -= quantity;
    await product.save();
  } catch (error) {
    console.error("Error decreasing product stock:", error);
  }
}

export async function cancelOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;

  try {
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Cancelled" } },
      { projection: { "orderDetails.$": 1 } }
    );
    const product = await productDb.findOneAndUpdate(
      { _id: order?.orderDetails[0].productId },
      { $inc: { quantity: order?.orderDetails[0].quantity } }
    );

    if (order?.orderDetails[0].orderStatus == "Cancelled") {
      if (order?.orderDetails[0].paymentMethod == "Razorpay") {
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
    }

    res.status(200).send("Order cancelled successfully");
  } catch (error) {
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

export async function ordersList(req: Request, res: Response) {
  try {
    const coupon = await CouponDb.find({ userUsed: req.session.userId });
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
    res.render("user/ordersList", { orders, user, cart, coupon });
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

    if (!order) {
      throw new Error("Order not found");
    }

    await productDb.findOneAndUpdate(
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
    console.error("Error returning order:", error);
    res.status(500).send("Error returning order");
  }
}
