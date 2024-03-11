import { Request,Response } from "express";
import Orderdb from "../../model/orderModel";
import userDb from "../../model/userModel";


export async function adminOrder(req:Request, res:Response) {
    try {
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
      ]);
  
      res.status(200).render("admin/adminOrders", { orders });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }


  
export async function updateOrder(req:Request,res:Response) {
    try {
  
      const { orderId, orderStatus } = req.body;
      const data = await Orderdb.aggregate([
        {
          $unwind: "$orderDetails"
        }
      ])
      await Orderdb.updateOne({"orderDetails._id":orderId},{$set:{"orderDetails.$.orderStatus":orderStatus}})
      
      res.status(200).json({ message: "Successfully Changed!" });
      
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      
    }
  }