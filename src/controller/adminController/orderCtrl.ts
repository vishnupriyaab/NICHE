import { Request, Response } from "express";
import Orderdb from "../../model/orderModel";
import userDb from "../../model/userModel";
import mongoose from "mongoose";

export async function adminOrder(req: Request, res: Response) {
  try {
    var page = 1;
    const limit = 5 ;
    if(req.query.page) {
      page = parseInt(req.query.page as string);
    } 
    const skip = (page - 1) * limit;
    const totalOrdersCount = (await Orderdb.aggregate([{ $unwind: "$orderDetails"}])).length;
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
    

    res
      .status(200)
      .render("admin/adminOrders", {
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
    // const data = await Orderdb.aggregate([
    //   {
    //     $unwind: "$orderDetails",
    //   },
    // ]);
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
export async function returnAproval(req:Request,res:Response) {
  try {
    const {orderId} = req.body;
    console.log(orderId,"00000000");
    await Orderdb.updateOne(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Returned" } }
    );
    res.status(200).json({ message: "Successfully ReturnStatus is Changed!" });
  } catch (error) {
    console.log(error);
  }
  
}