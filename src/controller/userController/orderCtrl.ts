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
import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer-core";

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
    const shipping = 60;
    const sum = products.reduce((total, product) => {
      return (
        total +
        Math.round(
          product.products.quantity *
            (product.productsDetails.offerApplied
              ? Math.ceil(product.productsDetails.offerPrice)
              : product.productsDetails.price)
        )
      );
    }, 0);

    res.status(200).render("user/checkout", {
      address,
      shipping,
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

export async function placeOrder(req: Request, res: Response): Promise<void> {
  try {
    const { paymentMethod, address, price, activeCoupon } = req.body;
    const priceWithoutCurrency = price.replace(/[^\d.]/g, "");
    let totalsum = Number(priceWithoutCurrency);
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
      var order = await instance.orders.create({
        amount: totalsum * 100,
        currency: "INR",
        receipt: "order_rcptid_11",
      });
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
      let orgPrice;
      let offerApplied;
      const orderItems: any = cartItems.map((element) => {
        if (element.productsDetails.offerApplied === true) {
          orgPrice = Math.ceil(
            element.productsDetails.offerPrice * element.products.quantity
          );
          offerApplied = true;
        } else {
          orgPrice = Math.ceil(
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
          paymentStatus: "Pending",
        };
        return orderItem;
      });
      let couponAmount = 0;
      let couponApplied: boolean = false;
      if (activeCoupon) {
        const usedCoupon = await CouponDb.findOne({ couponCode: activeCoupon });
        if (usedCoupon) {
          let discountPercentage = usedCoupon.coupondiscount;
          couponAmount = Math.ceil(
            (req.session as any).sum * (discountPercentage / 100)
          );
          couponApplied = true;
        }
      }

      const shippingCharge = 60;
      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
        couponApplied: couponApplied,
        couponDiscount: couponAmount,
        fixedShippingCharge: shippingCharge,
      });

      await newOrder.save();

      delete (req.session as any).address;
      delete (req.session as any).sum;
      delete (req.session as any).paymentMethod;

      await clearUserCart(req.session.userId);
      res.status(200).json({ order, newOrder, message: "successfully" });
      return;
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
      let couponAmount = 0;
      if (usedCoupon) {
        couponAmount = usedCoupon.coupondiscount;
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
          paymentStatus: "Completed",
        };
        return orderItem;
      });
      let couponApplied: boolean = false;
      if (usedCoupon) {
        const usedCoupon = await CouponDb.findOne({ couponCode: activeCoupon });
        if (usedCoupon) {
          let discountPercentage = usedCoupon.coupondiscount;
          couponAmount = Math.ceil(
            (req.session as any).sum * (discountPercentage / 100)
          );
          couponApplied = true;
        }
      }

      const shippingCharge = 60;
      const newOrder = new Orderdb({
        userId: userId,
        orderDetails: orderItems,
        totalsum: (req.session as any).sum,
        couponDiscount: couponAmount,
        couponApplied: couponApplied,
        fixedShippingCharge: shippingCharge,
      });
      await newOrder.save();
      const a = await CouponDb.updateOne(
        { couponCode: req.session.couponCode },
        { $push: { userUsed: req.session.userId }, $inc: { maxUse: -1 } }
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

      const sum: number = cartItems.reduce((total, product) => {
        return (
          total +
          product.products.quantity *
            (product.productsDetails.offerPrice
              ? product.productsDetails.offerPrice
              : product.productsDetails.price)
        );
      }, 0);

      if (!wallet || sum >= wallet.walletBalance) {
        res.status(200).json({
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
            paymentStatus: "Completed",
          };
          return orderItem;
        });

        let couponApplied: boolean = false;
        if (activeCoupon) {
          const usedCoupon = await CouponDb.findOne({
            couponCode: activeCoupon,
          });
          console.log(usedCoupon, "usedCoupon");
          if (usedCoupon) {
            let discountPercentage = usedCoupon.coupondiscount;
            couponAmount = Math.ceil(
              (req.session as any).sum * (discountPercentage / 100)
            );
            couponApplied = true;
          }
        }

        const shippingCharge = 60;
        const newOrder = new Orderdb({
          userId: userId,
          orderDetails: orderItems,
          totalsum: (req.session as any).sum,
          couponDiscount: couponAmount,
          couponApplied: couponApplied,
          fixedShippingCharge: shippingCharge,
        });
        await newOrder.save();

        const amount = Math.round(sum);

        await Walletdb.updateOne(
          { userId: req.session.userId },
          {
            $inc: { walletBalance: -amount },
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
    const orderId = req.query.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const body_data = razorpay_order_id + "|" + razorpay_payment_id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET as string)
      .update(body_data)
      .digest("hex");
    const isValid = generated_signature === razorpay_signature;

    if (isValid) {
      const orderData = await Orderdb.findOne({ _id: orderId });

      orderData?.orderDetails.forEach((order) => {
        order.paymentStatus = "Completed";
      });

      orderData?.save();
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

    await CartDb.updateOne({ userId }, { products: [], cartTotal: 0 });

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
    product.sold += quantity;
    await product.save();
    console.log(product, "product");
  } catch (error) {
    console.error("Error decreasing product stock:", error);
  }
}

export async function cancelOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;
  const singleOrderId = req.body.singleOrderId;
  try {
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": singleOrderId, _id: orderId },
      {
        $set: {
          "orderDetails.$.orderStatus": "Cancelled",
          "orderDetails.$.paymentStatus": "Cancelled",
        },
      },
      { projection: { "orderDetails.$": 1, totalsum: 1 } }
    );

    const productsss = await productDb.findOneAndUpdate(
      { _id: order?.orderDetails[0].productId },
      { $inc: { quantity: order?.orderDetails[0].quantity } }
    );

    if (
      order?.orderDetails[0].paymentMethod == "Razorpay" ||
      order?.orderDetails[0].paymentMethod == "Cwallet"
    ) {
      const user = await userDb.findOne({ _id: req.session.userId });
      if (!user) {
        throw new Error("User not found");
      }

      let amount;
      if (order.orderDetails.length === 1) {
        amount = order.totalsum;
      } else {
        amount = order.orderDetails[0].price;
      }
      const wallet = await Walletdb.updateOne(
        { userId: req.session.userId },
        {
          $inc: { walletBalance: amount },
          $push: { transactions: { amount: amount, type: "+ CREDIT" } },
        },
        { upsert: true }
      );
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
      { "orderDetails.$": 1, _id: 1, userId: 1, couponDiscount: 1, totalsum: 1 }
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
      { $set: { "orderDetails.$.orderStatus": "Returned request" } },
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

export async function downloadInvoicePDF(
  req: Request,
  res: Response
): Promise<void> {
  const orderId = req.params.orderId;
  console.log(orderId);
  const order = await Orderdb.findById(orderId).populate("userId");

  if (!order) {
    res.status(404).send("Order not found.");
    return;
  }

  const templatePath = path.join(__dirname, "../../views/user/invoicePDF.ejs");

  const templateData = {
    order,
    currentDate: new Date().toDateString(),
  };

  try {
    const htmlTemplate = await ejs.renderFile(templatePath, templateData);
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/snap/bin/chromium",
    });
    const page = await browser.newPage();

    await page.setContent(htmlTemplate);
    const pdfBuffer = await page.pdf();
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice_${orderId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF.");
  }
}

export async function retryPayment(req: Request, res: Response): Promise<void> {
  try {
    const ordersId = req.query.id;
    const failedOrder = await Orderdb.findOne({ _id: ordersId });
    console.log(failedOrder, "failedOrder");
    if (!failedOrder) {
      console.log("Order not found");
      res.status(404).send("Order not found");
      return;
    }
    var instance = new Razorpay({
      key_id: process.env.RZP_KEY_ID as string,
      key_secret: process.env.RZP_KEY_SECRET as string,
    });

    const order = await instance.orders.create({
      amount: failedOrder.totalsum * 100,
      currency: "INR",
      receipt: failedOrder._id.toString(),
    });

    res.json({ success: true, order, ordersId: failedOrder.id, failedOrder });
  } catch (error: any) {
    console.log(error);
    res.send(error);
  }
}

export async function retryPaymentVerify(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { orderId, paymentId, signature, newOrderId, productId } = req.body;

    const secret: string = process.env.RZP_KEY_SECRET!;
    console.log(signature, "signature", secret);

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature == signature) {
      console.log("1234567890");
      const updatedOrder = await Orderdb.updateOne(
        { _id: newOrderId, "orderDetails.productId": productId },
        { $set: { "orderDetails.$.paymentStatus": "completed" } }
      );
      // console.log(updatedOrder,'12345678');

      res.json({
        success: true,
        orderId: newOrderId,
        message: "Payment verified successfully",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error: any) {
    console.log(error);
    res.send(error);
  }
}
