import { SessionData } from "express-session";
import { getAllCoupon, getAllDeletedCoupons } from "../../config/dbHelper";
import CartDb from "../../model/cartModel";
import categoryDb from "../../model/categoryModel";
import CouponDb from "../../model/couponModel";
import { Request, Response } from "express";
import Category from "../../interface/categoryInterface";

function generateCouponCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 5;
  let couponCode = "";

  for (let i = 0; i < length; i++) {
    couponCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return couponCode;
}

export async function adminCoupon(req: Request, res: Response) {
  try {
    const allcoupons = await CouponDb.find();
    const category = await categoryDb.find();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
    const coupons = await getAllCoupon(null, page);
    const totalCoupons = allcoupons.length;

    res.render("admin/adminCoupon", {
      coupons,
      totalCoupons,
      category,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminAddCoupon(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const category = await categoryDb.find();
    res.render("admin/adminAddCoupon", { category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function addCoupon(req: Request, res: Response): Promise<void> {
  try {
    console.log("START");

    const {
      couponDescription,
      category,
      maxUse,
      priceLimit,
      coupondiscount,
      expiry,
    } = req.body;
    const couponCode = generateCouponCode();

    console.log("Generated Coupon Code:", couponCode);

    const regexCode = new RegExp(couponCode, "i");

    const duplicate = await CouponDb.findOne({
      couponCode: { $regex: regexCode },
    });
    if (
      !couponDescription ||
      !category ||
      !maxUse ||
      !priceLimit ||
      !coupondiscount ||
      !expiry
    ) {
      res
        .status(500)
        .json({ errStatus: true, message: "Content cannot be empty" });
      return;
    }
    if (duplicate) {
      res
        .status(401)
        .json({ errStatus: true, message: "Coupon already exist" });
      return;
    }
    const newCoupon = new CouponDb({
      couponCode,
      couponDescription,
      category,
      maxUse,
      priceLimit,
      coupondiscount,
      expiry,
    });
    await newCoupon.save();
    res.status(201).json({ message: "Coupon Added" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminEditCoupon(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const coupon = await CouponDb.findById(id);
    const category = await categoryDb.find();
    console.log(coupon,"couponnnnn");
    
    res.render("admin/adminEditCoupon", { coupon, category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function updateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const {
      couponCode,
      couponDescription,
      category,
      maxUse,
      priceLimit,
      coupondiscount,
      expiry,
    } = req.body;
    const regexCode = new RegExp(couponCode, "i");
    // const duplicate = await Coupondb.findOne({
    //   couponCode: { $regex: regexCode },
    // });

    const duplicate = await CouponDb.findOne({
      couponCode: { $regex: new RegExp("^" + couponCode + "$", "i") },
      _id: { $ne: req.params.id },
    });

    if (!couponCode) {
      res.status(400).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!category) {
      res.status(400).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!maxUse) {
      res.status(400).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!priceLimit) {
      res.status(400).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!coupondiscount) {
      res.status(400).json({ errStatus: true, message: "Enter Discount" });
      return;
    }

    if (!expiry) {
      res.status(400).json({ errStatus: true, message: "Select the Date" });
      return;
    }

    if (duplicate) {
      res
        .status(400)
        .json({ errStatus: true, message: "Coupon already exist" });
      return;
    }

    const newCoupon = await CouponDb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          couponCode,
          couponDescription,
          category,
          maxUse,
          priceLimit,
          coupondiscount,
          expiry,
        },
      }
    );
    if (newCoupon) {
      res.status(201).json({ message: "Coupon Updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminDeletedCoupon(req: Request, res: Response) {
  try {
    const allcoupons = await CouponDb.find();
    const coupons = await getAllDeletedCoupons(
      null,
      req.query.page as undefined
    );
    const totalCoupons = allcoupons.length;
    console.log(coupons);

    res.render("admin/adminDeletedCoupons", {
      coupons,
      totalCoupons,
      currentPage: Number(req.query.page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function deleteCoupon(
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
  try {
    const couponId = req.params.id.trim(); // Trim any leading/trailing spaces
    const data = await CouponDb.findByIdAndUpdate(couponId, {
      $set: { isDeleted: true },
    });
    console.log(data);
    return res.status(201).json({ message: "Coupon Deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function checkCoupon(req: Request, res: Response) {
  const { couponCode, totalPrice, numericalValue } = req.body;
  const cart = await CartDb.find({ userId: req.session.userId });
  let sum: number = Number(totalPrice) - 60;
  console.log(totalPrice,numericalValue,"sumin Chekout");

  try {
    const coupon = await CouponDb.findOne({ couponCode: couponCode });

    if (!coupon) {
      return res.status(200).json({
        isValid: false,
        message: "Invalid coupon code. Please try again.",
      });
    }

    const sample = req.session.userId;
    const usedUser = await CouponDb.findOne({
      couponCode: coupon.couponCode,
      userUsed: { $in: [sample] },
    });

    if (usedUser) {
      res
        .status(200)
        .json({ isValid: false, message: "Coupon is Already Applied.." });
      return;
    }

    if (coupon.expiry.getTime() < Date.now()) {
      return res
        .status(200)
        .json({ isValid: false, message: "Coupon has expired." });
    }

    if (sum < coupon.priceLimit) {
      return res.status(200).json({
        isValid: false,
        message: "Product price exceeds coupon limit.",
      });
    }

    if (coupon.maxUse <= 0) {
      return res.status(200).json({
        isValid: false,
        message: "Coupon has reached its maximum usage limit.",
      });
    }

    (req.session as SessionData).couponCode = coupon.couponCode;
    
    const couponValue = Math.ceil(sum * (coupon.coupondiscount / 100));
    console.log(couponValue,"couponValue");
    const discount = Math.ceil((sum + 60)-couponValue);
    
    console.log(discount,"discount");
    
    return res.json({
      isValid: true,
      discount,
      couponValue,
      message: "coupon applied..!!!",
    });
  } catch (error) {
    console.error("Error checking coupon:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


