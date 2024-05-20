import { Request, Response } from "express";
import Orderdb from "../../model/orderModel";
import userDb from "../../model/userModel";
import mongoose from "mongoose";
import productDb from "../../model/productModel";
import Walletdb from "../../model/walletModel";

export async function adminOrder(req: Request, res: Response) {
  try {
    var page = 1;
    const limit = 5;
    if (req.query.page) {
      page = parseInt(req.query.page as string);
    }
    const skip = (page - 1) * limit;
    const totalOrdersCount = (
      await Orderdb.aggregate([{ $unwind: "$orderDetails" }])
    ).length;
    const totalPages = Math.ceil(totalOrdersCount / limit);

    const orders = await Orderdb.aggregate([
      {
        $unwind: "$orderDetails",
      },
      {
        $lookup: {
          from: userDb.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $sort: {
          "orderDetails.orderDate": -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // console.log(orders,"orders");

    res.status(200).render("admin/adminOrders", {
      orders,
      currentPage: page,
      totalPages: totalPages,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const { orderId, orderStatus } = req.body;
    await Orderdb.updateOne(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": orderStatus } }
    );
    res.status(200).json({ message: "Successfully Changed!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
export async function returnAproval(req: Request, res: Response) {
  try {
    const { orderId , singleOrderId } = req.body;
    console.log(orderId, singleOrderId, "singleOrderId", "orderId");
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": singleOrderId, _id: orderId },
      { $set: { "orderDetails.$.orderStatus": "Returned" } }
    );
    console.log(order,"000000");
    

    const productsss = await productDb.findOneAndUpdate(
      { _id: order?.orderDetails[0].productId },
      { $inc: { quantity: order?.orderDetails[0].quantity } }
    );

    if (
      order?.orderDetails[0].paymentMethod == "Razorpay" ||
      order?.orderDetails[0].paymentMethod == "Cwallet"
    ) {
      const user = await userDb.findOne({ _id: order.userId });
      if (!user) {
        throw new Error("User not found");
      }
      const amount = order.orderDetails[0].price;

      const wallet = await Walletdb.updateOne(
        { userId: order.userId },
        {
          $inc: { walletBalance: amount },
          $push: { transactions: { amount: amount, type: "+ CREDIT" } },
        },
        { upsert: true }
      );

      console.log(wallet,"1234123123123");
    }

    res.status(200).json({ message: "Successfully ReturnStatus is Changed!" });
  } catch (error) {
    console.log(error);

  }
}
