import { getAllCoupon } from "../../config/dbHelper";
import CouponDb from "../../model/couponModel";
import { Request, Response } from "express";

export async function adminCoupon(req:Request, res:Response) {
    try {
      const allcoupons = await CouponDb.find();
      const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
      const coupons = await getAllCoupon(null, page);
      
      const totalCoupons = allcoupons.length;
      console.log(coupons);
  
      res.render("/adminCoupon", {
        coupons,
        totalCoupons,
        currentPage: Number(req.query.page),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }